# Real-time WebSocket server for live dashboard updates
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Set, List
import websockets
from websockets.server import WebSocketServerProtocol
import sqlite3
from database import get_connection

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.connections: Set[WebSocketServerProtocol] = set()
        self.user_connections: Dict[str, WebSocketServerProtocol] = {}
        
    async def register(self, websocket: WebSocketServerProtocol, user_id: str = None):
        """Register a new WebSocket connection"""
        self.connections.add(websocket)
        if user_id:
            self.user_connections[user_id] = websocket
        logger.info(f"Client connected. Total connections: {len(self.connections)}")
        
    async def unregister(self, websocket: WebSocketServerProtocol, user_id: str = None):
        """Unregister a WebSocket connection"""
        self.connections.discard(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
        logger.info(f"Client disconnected. Total connections: {len(self.connections)}")
        
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if self.connections:
            message_str = json.dumps(message)
            await asyncio.gather(
                *[self.send_safe(conn, message_str) for conn in self.connections],
                return_exceptions=True
            )
            
    async def send_to_user(self, user_id: str, message: dict):
        """Send message to a specific user"""
        if user_id in self.user_connections:
            message_str = json.dumps(message)
            await self.send_safe(self.user_connections[user_id], message_str)
            
    async def send_safe(self, websocket: WebSocketServerProtocol, message: str):
        """Safely send message to WebSocket"""
        try:
            await websocket.send(message)
        except websockets.exceptions.ConnectionClosed:
            await self.unregister(websocket)
        except Exception as e:
            logger.error(f"Error sending message: {e}")

# Global WebSocket manager instance
ws_manager = WebSocketManager()

async def handle_client(websocket: WebSocketServerProtocol, path: str):
    """Handle individual WebSocket connections"""
    user_id = None
    try:
        await ws_manager.register(websocket)
        
        # Send initial data
        await send_initial_data(websocket)
        
        async for message in websocket:
            try:
                data = json.loads(message)
                await handle_message(websocket, data, user_id)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
            except Exception as e:
                logger.error(f"Error handling message: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        logger.info("Client connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await ws_manager.unregister(websocket, user_id)

async def handle_message(websocket: WebSocketServerProtocol, data: dict, user_id: str):
    """Handle incoming WebSocket messages"""
    message_type = data.get('type')
    
    if message_type == 'authenticate':
        user_id = data.get('user_id')
        await ws_manager.register(websocket, user_id)
        await websocket.send(json.dumps({
            'type': 'authenticated',
            'user_id': user_id
        }))
        
    elif message_type == 'request_data':
        await send_dashboard_data(websocket)
        
    elif message_type == 'mood_update':
        # Broadcast mood update to all clients
        await broadcast_mood_update(data)
        
    elif message_type == 'subscribe_notifications':
        # Handle notification subscriptions
        await handle_notification_subscription(websocket, data)

async def send_initial_data(websocket: WebSocketServerProtocol):
    """Send initial dashboard data to new connections"""
    try:
        # Get latest dashboard data
        dashboard_data = await get_realtime_dashboard_data()
        await websocket.send(json.dumps({
            'type': 'initial_data',
            'data': dashboard_data,
            'timestamp': datetime.now().isoformat()
        }))
    except Exception as e:
        logger.error(f"Error sending initial data: {e}")

async def send_dashboard_data(websocket: WebSocketServerProtocol):
    """Send current dashboard data"""
    try:
        dashboard_data = await get_realtime_dashboard_data()
        await websocket.send(json.dumps({
            'type': 'dashboard_update',
            'data': dashboard_data,
            'timestamp': datetime.now().isoformat()
        }))
    except Exception as e:
        logger.error(f"Error sending dashboard data: {e}")

async def broadcast_mood_update(data: dict):
    """Broadcast mood updates to all connected clients"""
    try:
        # Update database with new mood data
        employee_name = data.get('employee_name')
        mood = data.get('mood')
        burnout_score = data.get('burnout_score', 0)
        
        # Save to database (you'll need to import your database functions)
        save_mood_update(employee_name, mood, burnout_score)
        
        # Broadcast to all clients
        await ws_manager.broadcast({
            'type': 'mood_updated',
            'employee_name': employee_name,
            'mood': mood,
            'burnout_score': burnout_score,
            'timestamp': datetime.now().isoformat()
        })
        
        # Check for alerts
        await check_and_send_alerts(employee_name, mood, burnout_score)
        
    except Exception as e:
        logger.error(f"Error broadcasting mood update: {e}")

async def check_and_send_alerts(employee_name: str, mood: str, burnout_score: int):
    """Check for alert conditions and send notifications"""
    alerts = []
    
    # High burnout alert
    if burnout_score < 40:
        alerts.append({
            'type': 'high_burnout',
            'severity': 'critical',
            'employee': employee_name,
            'message': f'{employee_name} shows signs of severe burnout (Score: {burnout_score})',
            'action_required': True
        })
    
    # Mood-based alerts
    if mood in ['angry', 'sad', 'stressed']:
        alerts.append({
            'type': 'negative_mood',
            'severity': 'warning',
            'employee': employee_name,
            'message': f'{employee_name} is experiencing {mood} mood',
            'action_required': True
        })
    
    # Send alerts
    for alert in alerts:
        await ws_manager.broadcast({
            'type': 'alert',
            'alert': alert,
            'timestamp': datetime.now().isoformat()
        })

async def get_realtime_dashboard_data():
    """Get real-time dashboard data"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get recent mood data
        cursor.execute('''
            SELECT employee_name, mood, burnout_score, timestamp
            FROM mood_data 
            ORDER BY timestamp DESC 
            LIMIT 100
        ''')
        recent_moods = cursor.fetchall()
        
        # Get employee statistics
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT employee_name) as total_employees,
                AVG(burnout_score) as avg_burnout,
                COUNT(CASE WHEN burnout_score < 60 THEN 1 END) as at_risk_count
            FROM mood_data 
            WHERE timestamp > datetime('now', '-24 hours')
        ''')
        stats = cursor.fetchone()
        
        # Get trend data
        cursor.execute('''
            SELECT 
                DATE(timestamp) as date,
                AVG(burnout_score) as avg_score,
                COUNT(*) as check_ins
            FROM mood_data 
            WHERE timestamp > datetime('now', '-7 days')
            GROUP BY DATE(timestamp)
            ORDER BY date
        ''')
        trends = cursor.fetchall()
        
        conn.close()
        
        return {
            'recent_moods': [
                {
                    'employee_name': row[0],
                    'mood': row[1],
                    'burnout_score': row[2],
                    'timestamp': row[3]
                } for row in recent_moods
            ],
            'statistics': {
                'total_employees': stats[0] or 0,
                'avg_burnout': round(stats[1] or 0, 1),
                'at_risk_count': stats[2] or 0
            },
            'trends': [
                {
                    'date': row[0],
                    'avg_score': round(row[1], 1),
                    'check_ins': row[2]
                } for row in trends
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        return {}

def save_mood_update(employee_name: str, mood: str, burnout_score: int):
    """Save mood update to database"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO mood_data (employee_name, mood, burnout_score, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (employee_name, mood, burnout_score, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Error saving mood update: {e}")

async def handle_notification_subscription(websocket: WebSocketServerProtocol, data: dict):
    """Handle notification subscription requests"""
    subscription_type = data.get('subscription_type')
    employee_name = data.get('employee_name')
    
    # Store subscription preferences (you can extend this)
    await websocket.send(json.dumps({
        'type': 'subscription_confirmed',
        'subscription_type': subscription_type,
        'employee_name': employee_name
    }))

# Periodic tasks
async def periodic_health_check():
    """Periodically check system health and send updates"""
    while True:
        try:
            # Get current system status
            dashboard_data = await get_realtime_dashboard_data()
            
            # Broadcast health update
            await ws_manager.broadcast({
                'type': 'health_check',
                'data': dashboard_data,
                'timestamp': datetime.now().isoformat()
            })
            
            # Wait 30 seconds before next check
            await asyncio.sleep(30)
            
        except Exception as e:
            logger.error(f"Error in periodic health check: {e}")
            await asyncio.sleep(30)

async def main():
    """Main WebSocket server function"""
    logger.info("Starting WebSocket server on ws://localhost:8765")
    
    # Start periodic tasks
    asyncio.create_task(periodic_health_check())
    
    # Start WebSocket server
    async with websockets.serve(handle_client, "localhost", 8765):
        logger.info("WebSocket server started successfully")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
