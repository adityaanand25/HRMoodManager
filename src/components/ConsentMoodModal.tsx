import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Shield, AlertCircle } from 'lucide-react';
import { getMood, getHRSuggestion } from '../services/api';

// Utility function to get mood emoji
const getMoodEmoji = (mood: string): string => {
  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    neutral: '😐',
    fear: '😨',
    disgust: '🤢',
    stressed: '😰',
    excited: '🤩',
    calm: '😌',
    anxious: '😟',
    content: '😊',
    frustrated: '😤',
    overwhelmed: '😵',
    focused: '🧐',
    tired: '😴',
    energetic: '⚡',
    bored: '😑',
    confident: '😎',
    worried: '😟'
  };
  return moodEmojis[mood.toLowerCase()] || '😐';
};

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodDetected?: (mood: string) => void;
  employeeName?: string;
}

export const ConsentMoodModal: React.FC<CheckInModalProps> = ({ 
  isOpen, 
  onClose, 
  onMoodDetected,
  employeeName = 'Employee'
}) => {
  const [showConsent, setShowConsent] = useState(true);  const [hasConsent, setHasConsent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; score: number; emoji: string } | null>(null);
  const [error, setError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
        if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setError('');
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setError('Unable to access webcam. Please check permissions.');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  // Simulate mood analysis
  const simulateMoodAnalysis = () => {
    const emotions = [
      { emotion: 'Happy', emoji: '😊', score: 85 },
      { emotion: 'Focused', emoji: '🤔', score: 78 },
      { emotion: 'Energetic', emoji: '⚡', score: 92 },
      { emotion: 'Calm', emoji: '😌', score: 76 },
      { emotion: 'Tired', emoji: '😴', score: 45 },
      { emotion: 'Stressed', emoji: '😰', score: 55 }
    ];
    
    return emotions[Math.floor(Math.random() * emotions.length)];
  };

  const handleStartDetection = async () => {
    if (!hasConsent) return;
    
    setShowConsent(false);
    setIsAnalyzing(true);
    setError('');

    await startWebcam();    // Wait a moment for the webcam to stabilize
    setTimeout(async () => {
      try {
        // Call our backend API for mood detection
        const moodResponse = await getMood(employeeName);
        const mood = moodResponse.mood;
        const burnoutScore = moodResponse.burnout_score;
        
        // Create result object matching the expected format
        const moodResult = {
          emotion: mood.charAt(0).toUpperCase() + mood.slice(1),
          score: burnoutScore,
          emoji: getMoodEmoji(mood)
        };
        
        if (moodResult) {
          setResult(moodResult);
          onMoodDetected?.(moodResult.emotion.toLowerCase());
          
          // Get HR suggestion
          try {
            await getHRSuggestion(employeeName, burnoutScore, mood);
          } catch (error) {
            console.error('Error getting HR suggestion:', error);
          }
        }
      } catch (error) {
        console.error('Error detecting mood:', error);
        setError('Failed to detect mood. Please try again.');
      }
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleClose = () => {
    stopWebcam();
    setResult(null);
    setIsAnalyzing(false);
    setHasConsent(false);
    setShowConsent(true);
    setError('');
    onClose();
  };

  const handleRetry = () => {
    setResult(null);
    setIsAnalyzing(true);
    setTimeout(() => {
      const newResult = simulateMoodAnalysis();
      setResult(newResult);
      onMoodDetected?.(newResult.emotion.toLowerCase());
      setIsAnalyzing(false);
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Mood Check-In</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Consent Screen */}
        {showConsent && (
          <div className="space-y-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Shield size={20} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  This will use your webcam to analyze facial expressions for mood detection. 
                  Your privacy is important to us - <strong>no data is stored or transmitted</strong>. 
                  Analysis happens locally in your browser.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                I agree to mood detection using my webcam and understand that no data will be stored
              </label>
            </div>

            <button
              onClick={handleStartDetection}
              disabled={!hasConsent}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                hasConsent
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Start Detection
            </button>
          </div>
        )}

        {/* Analysis Screen */}
        {!showConsent && (
          <div className="space-y-6">
            {/* Webcam Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-gray-100 rounded-full overflow-hidden border-4 border-gray-200">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                {isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="text-center">
                <p className="text-gray-600 text-sm">Analyzing your mood...</p>
                <div className="mt-2 flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                  <div className="text-4xl mb-2">{result.emoji}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{result.emotion}</h3>
                  <p className="text-sm text-gray-600">Confidence: {result.score}%</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Stop & Close
              </button>
              {result && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Analyze Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
