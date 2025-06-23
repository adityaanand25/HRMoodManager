import React, { useState, useEffect } from 'react';
import { Activity, Heart, Zap, Moon, TrendingUp, Watch, Bluetooth, Wifi } from 'lucide-react';

interface BiometricData {
  heartRate: number;
  stressLevel: number;
  sleepScore: number;
  activityLevel: number;
  hrv: number; // Heart Rate Variability
  bloodOxygen: number;
  lastSync: string;
  deviceConnected: boolean;
}

interface BiometricIntegrationProps {
  employeeName?: string;
  className?: string;
}

export const BiometricIntegration: React.FC<BiometricIntegrationProps> = ({ 
  employeeName = 'Current User',
  className = '' 
}) => {
  const [biometricData, setBiometricData] = useState<BiometricData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBiometricData();
    const interval = setInterval(fetchBiometricData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBiometricData = async () => {
    try {
      // Simulate real-time biometric data from wearable devices
      const mockData: BiometricData = {
        heartRate: Math.floor(Math.random() * 30 + 60), // 60-90 BPM
        stressLevel: Math.floor(Math.random() * 100), // 0-100
        sleepScore: Math.floor(Math.random() * 40 + 60), // 60-100
        activityLevel: Math.floor(Math.random() * 100), // 0-100
        hrv: Math.floor(Math.random() * 50 + 25), // 25-75 ms
        bloodOxygen: Math.floor(Math.random() * 5 + 95), // 95-100%
        lastSync: new Date().toISOString(),
        deviceConnected: Math.random() > 0.2 // 80% chance of being connected
      };
      
      setBiometricData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching biometric data:', error);
      setLoading(false);
    }
  };

  const connectDevice = async () => {
    setIsConnecting(true);
    // Simulate device connection
    setTimeout(() => {
      setBiometricData(prev => prev ? { ...prev, deviceConnected: true } : null);
      setIsConnecting(false);
    }, 2000);
  };

  const getHealthStatus = (value: number, type: string) => {
    switch (type) {
      case 'heartRate':
        if (value < 60) return { status: 'Low', color: 'text-blue-600' };
        if (value > 100) return { status: 'High', color: 'text-red-600' };
        return { status: 'Normal', color: 'text-green-600' };
      
      case 'stress':
        if (value < 30) return { status: 'Low', color: 'text-green-600' };
        if (value > 70) return { status: 'High', color: 'text-red-600' };
        return { status: 'Moderate', color: 'text-yellow-600' };
      
      case 'sleep':
        if (value < 70) return { status: 'Poor', color: 'text-red-600' };
        if (value > 85) return { status: 'Excellent', color: 'text-green-600' };
        return { status: 'Good', color: 'text-blue-600' };
      
      default:
        return { status: 'Normal', color: 'text-gray-600' };
    }
  };

  const BiometricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color, 
    type,
    trend 
  }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    color: string;
    type: string;
    trend?: 'up' | 'down' | 'stable';
  }) => {
    const healthStatus = getHealthStatus(value, type);
    
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp 
                size={12} 
                className={trend === 'down' ? 'rotate-180' : trend === 'stable' ? 'rotate-90' : ''}
              />
            </div>
          )}
        </div>
        <div className="mb-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500 ml-1">{unit}</span>
        </div>
        <div className="text-xs text-gray-600 mb-1">{title}</div>
        <div className={`text-xs font-medium ${healthStatus.color}`}>
          {healthStatus.status}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Biometric Integration</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Syncing devices...</span>
        </div>
      </div>
    );
  }

  if (!biometricData) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
        <div className="text-center py-8">
          <Watch size={48} className="text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Device Connected</h4>
          <p className="text-gray-600 mb-4">Connect your wearable device to track wellness metrics</p>
          <button 
            onClick={connectDevice}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Connect Device
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="text-red-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Biometric Monitoring</h3>
            <p className="text-sm text-gray-600">{employeeName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {biometricData.deviceConnected ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Wifi size={16} />
              <span className="text-xs font-medium">Connected</span>
            </div>
          ) : (
            <button
              onClick={connectDevice}
              disabled={isConnecting}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Bluetooth size={16} />
              <span className="text-xs font-medium">
                {isConnecting ? 'Connecting...' : 'Connect'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <BiometricCard
          title="Heart Rate"
          value={biometricData.heartRate}
          unit="BPM"
          icon={Heart}
          color="bg-red-500"
          type="heartRate"
          trend="stable"
        />
        
        <BiometricCard
          title="Stress Level"
          value={biometricData.stressLevel}
          unit="%"
          icon={Zap}
          color="bg-orange-500"
          type="stress"
          trend="down"
        />
        
        <BiometricCard
          title="Sleep Score"
          value={biometricData.sleepScore}
          unit="/100"
          icon={Moon}
          color="bg-purple-500"
          type="sleep"
          trend="up"
        />
        
        <BiometricCard
          title="Activity"
          value={biometricData.activityLevel}
          unit="%"
          icon={Activity}
          color="bg-green-500"
          type="activity"
          trend="up"
        />
        
        <BiometricCard
          title="HRV"
          value={biometricData.hrv}
          unit="ms"
          icon={TrendingUp}
          color="bg-blue-500"
          type="hrv"
          trend="stable"
        />
        
        <BiometricCard
          title="Blood O2"
          value={biometricData.bloodOxygen}
          unit="%"
          icon={Activity}
          color="bg-cyan-500"
          type="oxygen"
          trend="stable"
        />
      </div>

      {/* Health Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Health Insights</h4>
        <div className="space-y-1 text-sm text-gray-700">
          {biometricData.stressLevel > 70 && (
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Elevated stress detected - consider taking a break</span>
            </p>
          )}
          {biometricData.sleepScore < 70 && (
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Poor sleep quality - affects daytime performance</span>
            </p>
          )}
          {biometricData.heartRate > 100 && (
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Elevated heart rate - monitor closely</span>
            </p>
          )}
          {biometricData.stressLevel < 30 && biometricData.sleepScore > 85 && (
            <p className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Excellent wellness indicators - keep it up!</span>
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-2">Personalized Recommendations</h4>
        <div className="space-y-1 text-sm text-gray-700">
          <p>• Take 5-minute breathing exercises every 2 hours</p>
          <p>• Aim for 7-8 hours of quality sleep tonight</p>
          <p>• Consider a 10-minute walk to boost activity</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last sync: {new Date(biometricData.lastSync).toLocaleTimeString()}
      </div>
    </div>
  );
};
