# Smart Notification System with Proactive Interventions
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
import sqlite3
from database import get_connection
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class NotificationPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationType(Enum):
    BURNOUT_ALERT = "burnout_alert"
    MOOD_DECLINE = "mood_decline"
    WELLNESS_REMINDER = "wellness_reminder"
    TEAM_HEALTH = "team_health"
    ACHIEVEMENT = "achievement"
    CHECK_IN_REMINDER = "check_in_reminder"
    INTERVENTION_NEEDED = "intervention_needed"

class SmartNotificationSystem:
    """Advanced notification system with intelligent routing and timing"""
    
    def __init__(self):
        self.notification_rules = self._load_notification_rules()
        self.user_preferences = {}
        self.notification_history = []
    
    def generate_smart_notifications(self, employee_name: str, mood: str, burnout_score: float) -> List[Dict]:
        """Generate smart notifications based on employee data"""
        notifications = []
        
        # Critical burnout alerts
        if burnout_score < 30:
            notifications.append({
                'type': 'critical_alert',
                'priority': 'high',
                'title': f'🚨 Critical Burnout Alert - {employee_name}',
                'message': f'{employee_name} shows critical burnout symptoms (Score: {burnout_score}). Immediate intervention required.',
                'action_items': [
                    'Schedule immediate one-on-one meeting',
                    'Consider workload redistribution',
                    'Offer mental health resources',
                    'Evaluate emergency time-off'
                ],
                'timestamp': datetime.now().isoformat()
            })
        
        # High risk alerts
        elif burnout_score < 50:
            notifications.append({
                'type': 'burnout_alert',
                'priority': 'medium',
                'title': f'⚠️ High Burnout Risk - {employee_name}',
                'message': f'{employee_name} is at high risk of burnout (Score: {burnout_score}). Proactive measures recommended.',
                'action_items': [
                    'Schedule wellness check-in within 24 hours',
                    'Review current workload and deadlines',
                    'Suggest stress management resources'
                ],
                'timestamp': datetime.now().isoformat()
            })
        
        # Mood-based notifications
        if mood in ['sad', 'angry', 'stressed']:
            notifications.append({
                'type': 'mood_concern',
                'priority': 'medium',
                'title': f'😔 Mood Concern - {employee_name}',
                'message': f'{employee_name} is experiencing {mood} mood. Consider supportive intervention.',
                'action_items': [
                    'Offer supportive conversation',
                    'Check for work-related stressors',
                    'Provide employee assistance resources'
                ],
                'timestamp': datetime.now().isoformat()
            })
        
        # Positive reinforcement
        elif mood == 'happy' and burnout_score > 80:
            notifications.append({
                'type': 'positive_feedback',
                'priority': 'low',
                'title': f'🌟 Positive Performance - {employee_name}',
                'message': f'{employee_name} is performing well with positive mood. Consider recognition.',
                'action_items': [
                    'Acknowledge good performance',
                    'Consider for recognition program',
                    'Explore growth opportunities'
                ],
                'timestamp': datetime.now().isoformat()
            })
        
        return notifications
    
    def _load_notification_rules(self) -> Dict:
        """Load notification rules and thresholds"""
        return {
            'burnout_thresholds': {
                'critical': 30,
                'high': 50,
                'medium': 70
            },
            'mood_decline_window': 3,  # days
            'reminder_intervals': {
                'check_in': 24,  # hours
                'wellness': 72   # hours
            },
            'quiet_hours': {
                'start': 18,  # 6 PM
                'end': 8      # 8 AM
            }
        }
    
    async def process_employee_update(self, employee_data: Dict) -> List[Dict]:
        """Process employee update and generate appropriate notifications"""
        notifications = []
        employee_name = employee_data.get('name', 'Unknown')
        burnout_score = employee_data.get('burnout_score', 50)
        mood = employee_data.get('mood', 'neutral')
        
        # Check for burnout alerts
        burnout_notifications = await self._check_burnout_alerts(employee_name, burnout_score)
        notifications.extend(burnout_notifications)
        
        # Check for mood decline patterns
        mood_notifications = await self._check_mood_patterns(employee_name, mood)
        notifications.extend(mood_notifications)
        
        # Check for wellness reminders
        wellness_notifications = await self._check_wellness_reminders(employee_name)
        notifications.extend(wellness_notifications)
        
        # Store notifications
        for notification in notifications:
            await self._store_notification(notification)
        
        return notifications
    
    async def _check_burnout_alerts(self, employee_name: str, burnout_score: int) -> List[Dict]:
        """Check for burnout-related alerts"""
        notifications = []
        rules = self.notification_rules['burnout_thresholds']
        
        if burnout_score <= rules['critical']:
            notifications.append({
                'type': NotificationType.INTERVENTION_NEEDED.value,
                'priority': NotificationPriority.CRITICAL.value,
                'employee': employee_name,
                'title': f'🚨 Critical Burnout Alert - {employee_name}',
                'message': f'{employee_name} shows severe burnout symptoms (Score: {burnout_score}). Immediate intervention required.',
                'data': {
                    'burnout_score': burnout_score,
                    'threshold': 'critical',
                    'action_items': [
                        'Schedule immediate one-on-one meeting',
                        'Consider workload redistribution',
                        'Offer mental health resources',
                        'Evaluate time-off requirements'
                    ]
                },
                'recipients': ['hr_manager', 'direct_manager'],
                'timestamp': datetime.now().isoformat()
            })
            
        elif burnout_score <= rules['high']:
            notifications.append({
                'type': NotificationType.BURNOUT_ALERT.value,
                'priority': NotificationPriority.HIGH.value,
                'employee': employee_name,
                'title': f'⚠️ High Burnout Risk - {employee_name}',
                'message': f'{employee_name} is at high risk of burnout (Score: {burnout_score}). Proactive measures recommended.',
                'data': {
                    'burnout_score': burnout_score,
                    'threshold': 'high',
                    'action_items': [
                        'Schedule wellness check-in',
                        'Review current workload',
                        'Suggest stress management resources'
                    ]
                },
                'recipients': ['hr_manager', 'direct_manager'],
                'timestamp': datetime.now().isoformat()
            })
        
        return notifications
    
    async def _check_mood_patterns(self, employee_name: str, current_mood: str) -> List[Dict]:
        """Check for concerning mood patterns"""
        notifications = []
        
        # Get recent mood history
        mood_history = await self._get_recent_moods(employee_name, days=7)
        
        if len(mood_history) >= 3:
            negative_moods = ['sad', 'angry', 'stressed', 'anxious']
            recent_negative = sum(1 for mood in mood_history[-3:] if mood.lower() in negative_moods)
            
            if recent_negative >= 2:
                notifications.append({
                    'type': NotificationType.MOOD_DECLINE.value,
                    'priority': NotificationPriority.HIGH.value,
                    'employee': employee_name,
                    'title': f'📉 Mood Decline Pattern - {employee_name}',
                    'message': f'{employee_name} shows persistent negative mood patterns over recent check-ins.',
                    'data': {
                        'recent_moods': mood_history[-5:],
                        'negative_count': recent_negative,
                        'current_mood': current_mood,
                        'action_items': [
                            'Schedule supportive conversation',
                            'Offer employee assistance programs',
                            'Consider flexible work arrangements'
                        ]
                    },
                    'recipients': ['hr_manager', 'direct_manager'],
                    'timestamp': datetime.now().isoformat()
                })
        
        return notifications
    
    async def _check_wellness_reminders(self, employee_name: str) -> List[Dict]:
        """Check if wellness reminders are needed"""
        notifications = []
        
        # Check last check-in time
        last_checkin = await self._get_last_checkin_time(employee_name)
        if last_checkin:
            hours_since_checkin = (datetime.now() - last_checkin).total_seconds() / 3600
            
            if hours_since_checkin > self.notification_rules['reminder_intervals']['check_in']:
                notifications.append({
                    'type': NotificationType.CHECK_IN_REMINDER.value,
                    'priority': NotificationPriority.LOW.value,
                    'employee': employee_name,
                    'title': f'💝 Wellness Check-in Reminder',
                    'message': f'Hi {employee_name}! It\'s been a while since your last mood check-in. How are you feeling today?',
                    'data': {
                        'last_checkin': last_checkin.isoformat(),
                        'hours_since': round(hours_since_checkin, 1)
                    },
                    'recipients': ['employee'],
                    'timestamp': datetime.now().isoformat()
                })
        
        return notifications
    
    async def generate_team_notifications(self, team_data: List[Dict]) -> List[Dict]:
        """Generate team-level notifications"""
        notifications = []
        
        if not team_data:
            return notifications
        
        # Calculate team metrics
        burnout_scores = [member.get('burnout_score', 50) for member in team_data]
        avg_burnout = sum(burnout_scores) / len(burnout_scores)
        critical_members = len([score for score in burnout_scores if score < 40])
        
        # Team health alert
        if avg_burnout < 55 or critical_members > len(team_data) * 0.25:
            notifications.append({
                'type': NotificationType.TEAM_HEALTH.value,
                'priority': NotificationPriority.HIGH.value,
                'title': '🏢 Team Health Alert',
                'message': f'Team showing signs of collective burnout. Average score: {avg_burnout:.1f}, {critical_members} members at critical risk.',
                'data': {
                    'team_size': len(team_data),
                    'avg_burnout': round(avg_burnout, 1),
                    'critical_members': critical_members,
                    'team_distribution': self._calculate_team_distribution(burnout_scores),
                    'action_items': [
                        'Review team workload distribution',
                        'Consider team building activities',
                        'Implement team wellness initiatives',
                        'Schedule team health meeting'
                    ]
                },
                'recipients': ['hr_manager', 'team_lead'],
                'timestamp': datetime.now().isoformat()
            })
        
        return notifications
    
    async def generate_achievement_notifications(self, employee_name: str, achievement_data: Dict) -> Dict:
        """Generate positive achievement notifications"""
        return {
            'type': NotificationType.ACHIEVEMENT.value,
            'priority': NotificationPriority.MEDIUM.value,
            'employee': employee_name,
            'title': f'🎉 Wellness Achievement - {employee_name}',
            'message': f'Congratulations! {employee_name} has achieved a wellness milestone.',
            'data': achievement_data,
            'recipients': ['employee', 'hr_manager'],
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_team_distribution(self, scores: List[int]) -> Dict:
        """Calculate team burnout score distribution"""
        return {
            'critical': len([s for s in scores if s < 40]),
            'high_risk': len([s for s in scores if 40 <= s < 60]),
            'medium_risk': len([s for s in scores if 60 <= s < 75]),
            'low_risk': len([s for s in scores if s >= 75])
        }
    
    async def _get_recent_moods(self, employee_name: str, days: int = 7) -> List[str]:
        """Get recent mood history for an employee"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT mood FROM mood_data 
                WHERE employee_name = ? AND timestamp > datetime('now', '-{} days')
                ORDER BY timestamp DESC
            '''.format(days), (employee_name,))
            
            moods = [row[0] for row in cursor.fetchall()]
            conn.close()
            return moods
            
        except Exception as e:
            print(f"Error getting recent moods: {e}")
            return []
    
    async def _get_last_checkin_time(self, employee_name: str) -> Optional[datetime]:
        """Get the last check-in time for an employee"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT MAX(timestamp) FROM mood_data 
                WHERE employee_name = ?
            ''', (employee_name,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result and result[0]:
                return datetime.fromisoformat(result[0])
            return None
            
        except Exception as e:
            print(f"Error getting last check-in time: {e}")
            return None
    
    async def _store_notification(self, notification: Dict):
        """Store notification in database"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Create notifications table if not exists
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    employee TEXT,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    data TEXT,
                    recipients TEXT,
                    timestamp TEXT NOT NULL,
                    sent BOOLEAN DEFAULT FALSE,
                    read BOOLEAN DEFAULT FALSE
                )
            ''')
            
            cursor.execute('''
                INSERT INTO notifications 
                (type, priority, employee, title, message, data, recipients, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                notification['type'],
                notification['priority'],
                notification.get('employee'),
                notification['title'],
                notification['message'],
                json.dumps(notification.get('data', {})),
                json.dumps(notification.get('recipients', [])),
                notification['timestamp']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error storing notification: {e}")
    
    async def get_notifications(self, recipient: str = None, unread_only: bool = False) -> List[Dict]:
        """Get notifications for a specific recipient"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            query = "SELECT * FROM notifications WHERE 1=1"
            params = []
            
            if recipient:
                query += " AND recipients LIKE ?"
                params.append(f'%{recipient}%')
            
            if unread_only:
                query += " AND read = FALSE"
            
            query += " ORDER BY timestamp DESC LIMIT 50"
            
            cursor.execute(query, params)
            notifications = []
            
            for row in cursor.fetchall():
                notifications.append({
                    'id': row[0],
                    'type': row[1],
                    'priority': row[2],
                    'employee': row[3],
                    'title': row[4],
                    'message': row[5],
                    'data': json.loads(row[6]) if row[6] else {},
                    'recipients': json.loads(row[7]) if row[7] else [],
                    'timestamp': row[8],
                    'sent': row[9],
                    'read': row[10]
                })
            
            conn.close()
            return notifications
            
        except Exception as e:
            print(f"Error getting notifications: {e}")
            return []
    
    async def mark_notification_read(self, notification_id: int):
        """Mark a notification as read"""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications SET read = TRUE WHERE id = ?
            ''', (notification_id,))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Error marking notification as read: {e}")

class NotificationDelivery:
    """Handle notification delivery through various channels"""
    
    def __init__(self):
        self.email_config = {
            'smtp_server': 'localhost',  # Configure your SMTP server
            'smtp_port': 587,
            'username': '',
            'password': ''
        }
    
    async def send_email_notification(self, notification: Dict, recipient_email: str):
        """Send notification via email"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config['username']
            msg['To'] = recipient_email
            msg['Subject'] = notification['title']
            
            body = self._create_email_body(notification)
            msg.attach(MIMEText(body, 'html'))
            
            # Note: Email sending is disabled in demo mode
            # Uncomment and configure for production use
            """
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['username'], self.email_config['password'])
            text = msg.as_string()
            server.sendmail(self.email_config['username'], recipient_email, text)
            server.quit()
            """
            
            print(f"Email notification would be sent to {recipient_email}: {notification['title']}")
            
        except Exception as e:
            print(f"Error sending email notification: {e}")
    
    def _create_email_body(self, notification: Dict) -> str:
        """Create HTML email body"""
        priority_colors = {
            'critical': '#dc2626',
            'high': '#ea580c',
            'medium': '#d97706',
            'low': '#059669'
        }
        
        color = priority_colors.get(notification['priority'], '#6b7280')
        
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="border-left: 4px solid {color}; padding-left: 20px; margin: 20px 0;">
                    <h2 style="color: {color}; margin-top: 0;">{notification['title']}</h2>
                    <p>{notification['message']}</p>
                    
                    {self._format_action_items(notification.get('data', {}).get('action_items', []))}
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 12px;">
                        Generated by MoodManager HR+ at {notification['timestamp']}
                    </p>
                </div>
            </body>
        </html>
        """
    
    def _format_action_items(self, action_items: List[str]) -> str:
        """Format action items for email"""
        if not action_items:
            return ""
        
        items_html = "".join([f"<li>{item}</li>" for item in action_items])
        return f"""
        <div style="margin: 15px 0;">
            <h4 style="color: #374151; margin-bottom: 10px;">Recommended Actions:</h4>
            <ul style="color: #4b5563;">
                {items_html}
            </ul>
        </div>
        """

# Factory functions
def create_notification_system():
    """Create notification system instance"""
    return SmartNotificationSystem()

def create_notification_delivery():
    """Create notification delivery instance"""
    return NotificationDelivery()

# Background notification processor
async def notification_processor():
    """Background task to process and send notifications"""
    notification_system = create_notification_system()
    
    while True:
        try:
            # Get unread notifications
            notifications = await notification_system.get_notifications(unread_only=True)
            
            for notification in notifications:
                # Process based on priority and type
                if notification['priority'] == NotificationPriority.CRITICAL.value:
                    # Send immediately
                    await process_critical_notification(notification)
                elif notification['priority'] == NotificationPriority.HIGH.value:
                    # Send within 5 minutes
                    await process_high_priority_notification(notification)
                
                # Mark as processed
                await notification_system.mark_notification_read(notification['id'])
            
            # Wait before next cycle
            await asyncio.sleep(60)  # Check every minute
            
        except Exception as e:
            print(f"Error in notification processor: {e}")
            await asyncio.sleep(60)

async def process_critical_notification(notification: Dict):
    """Process critical priority notifications"""
    print(f"🚨 CRITICAL ALERT: {notification['title']}")
    # Here you would integrate with external systems like Slack, Teams, etc.

async def process_high_priority_notification(notification: Dict):
    """Process high priority notifications"""
    print(f"⚠️ HIGH PRIORITY: {notification['title']}")
    # Here you would queue for near-immediate delivery
