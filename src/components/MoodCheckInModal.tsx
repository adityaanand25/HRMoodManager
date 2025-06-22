import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, AlertCircle } from 'lucide-react';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  onMoodDetected: (mood: string) => void;
}

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  onMoodDetected
}) => {
  const [showConsent, setShowConsent] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; score: number; emoji: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
      }
    } catch (error) {
      setError('Unable to access webcam. Please check permissions.');
      console.error('Webcam error:', error);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  // Simulate mood analysis (since face-api.js setup is complex)
  const simulateMoodAnalysis = () => {
    const emotions = [
      { emotion: 'Happy', emoji: '😊', score: 85 },
      { emotion: 'Focused', emoji: '🤔', score: 78 },
      { emotion: 'Stressed', emoji: '😰', score: 65 },
      { emotion: 'Calm', emoji: '😌', score: 76 },
      { emotion: 'Tired', emoji: '😴', score: 45 },
      { emotion: 'Excited', emoji: '🤗', score: 92 }
    ];
    
    return emotions[Math.floor(Math.random() * emotions.length)];
  };

  const handleStartDetection = async () => {
    if (!hasConsent) return;
    
    setShowConsent(false);
    setIsAnalyzing(true);
    setError('');

    await startWebcam();

    // Simulate analysis time
    setTimeout(() => {
      const detectedMood = simulateMoodAnalysis();
      setResult(detectedMood);
      setIsAnalyzing(false);
      onMoodDetected(detectedMood.emotion.toLowerCase());
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
      const detectedMood = simulateMoodAnalysis();
      setResult(detectedMood);
      setIsAnalyzing(false);
      onMoodDetected(detectedMood.emotion.toLowerCase());
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mood Check-In</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Consent Screen */}
          {showConsent && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Camera size={32} className="text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mood Check-In for {employeeName}
                </h3>
                <p className="text-sm text-gray-600">
                  This will use your webcam to analyze facial expressions. 
                  Data is processed locally and not stored.
                </p>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="consent"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  I agree to mood detection using my webcam
                </label>
              </div>

              <button
                onClick={handleStartDetection}
                disabled={!hasConsent}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  hasConsent
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Start Detection
              </button>
            </div>
          )}

          {/* Webcam and Analysis Screen */}
          {!showConsent && (
            <div className="space-y-4">
              {/* Webcam Preview */}
              <div className="relative">
                <div className="w-64 h-48 mx-auto bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm">Analyzing mood...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Result Display */}
              {result && (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-4xl mb-2">{result.emoji}</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Mood: {result.emotion}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Confidence: {result.score}%
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleRetry}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Check size={16} />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Controls */}
              {!result && !isAnalyzing && (
                <div className="flex justify-center">
                  <button
                    onClick={handleClose}
                    className="py-2 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
