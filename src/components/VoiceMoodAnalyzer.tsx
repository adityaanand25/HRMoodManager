import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Volume2, Activity } from 'lucide-react';
import { enhancedApi } from '../services/enhancedApi';

interface VoiceMoodAnalyzerProps {
  onMoodDetected?: (mood: string, confidence: number) => void;
  isEnabled?: boolean;
  employeeName?: string;
}

interface VoiceAnalysisResult {
  detected_mood: string;
  confidence: number;
  audio_quality: string;
  processing_time: number;
  features: {
    pitch_variance: number;
    speaking_rate: number;
    energy_level: number;
  };
}

export const VoiceMoodAnalyzer: React.FC<VoiceMoodAnalyzerProps> = ({ 
  onMoodDetected,
  isEnabled = true,
  employeeName = 'unknown'
}) => {  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      setAnalysisResult(null);
      setAudioUrl(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        
        // Create audio URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Analyze the audio
        analyzeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await enhancedApi.analyzeVoiceMood(audioBlob, employeeName);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setAnalysisResult(result);
      onMoodDetected?.(result.detected_mood, result.confidence);

    } catch (err) {
      console.error('Error analyzing voice:', err);
      setError('Failed to analyze voice. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play recording.');
      });
    }
  };

  const getMoodEmoji = (mood: string): string => {
    const emojiMap: { [key: string]: string } = {
      happy: '😊',
      excited: '🤩',
      calm: '😌',
      neutral: '😐',
      tired: '😴',
      stressed: '😰',
      sad: '😢',
      angry: '😡'
    };
    return emojiMap[mood] || '😐';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isEnabled) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <Mic className="text-gray-400 mx-auto mb-2" size={32} />
        <p className="text-gray-500">Voice analysis not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Volume2 className="text-purple-600 mr-2" size={24} />
          Voice Mood Analysis
        </h3>
        <div className="text-sm text-gray-500">
          {isRecording && `Recording: ${formatTime(recordingTime)}`}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
          >
            <Mic size={20} />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Square size={20} />
            <span>Stop Recording</span>
          </button>
        )}

        {audioUrl && (
          <button
            onClick={playRecording}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Play size={16} />
            <span>Play</span>
          </button>
        )}
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <Activity className="text-red-600 animate-pulse" size={24} />
            <span className="text-red-800 font-medium">Recording in progress...</span>
          </div>
        </div>
      )}

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-blue-800 font-medium">Analyzing voice patterns...</span>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Detected Mood</h4>
              <div className="text-3xl">{getMoodEmoji(analysisResult.detected_mood)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Mood:</span>
                <p className="text-lg font-medium text-gray-900 capitalize">
                  {analysisResult.detected_mood}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Confidence:</span>
                <p className={`text-lg font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                  {Math.round(analysisResult.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Voice Features */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Voice Analysis Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Pitch Variance:</span>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisResult.features.pitch_variance * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {Math.round(analysisResult.features.pitch_variance * 100)}%
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Speaking Rate:</span>
                <p className="text-gray-900 font-medium mt-1">
                  {Math.round(analysisResult.features.speaking_rate)} WPM
                </p>
              </div>
              
              <div>
                <span className="text-gray-600">Energy Level:</span>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisResult.features.energy_level * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {Math.round(analysisResult.features.energy_level * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              Audio Quality: {analysisResult.audio_quality} • 
              Processing Time: {analysisResult.processing_time}s
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <MicOff className="text-red-600" size={20} />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {!analysisResult && !isRecording && !isAnalyzing && (
        <div className="text-center py-6">
          <Mic className="text-gray-400 mx-auto mb-3" size={48} />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Voice Mood Analysis</h4>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Record a short voice sample (15-30 seconds) and our AI will analyze your mood 
            based on speech patterns, tone, and vocal characteristics.
          </p>
          <div className="mt-4 text-xs text-gray-500">
            💡 Speak naturally about your day or how you're feeling for best results
          </div>
        </div>
      )}
    </div>
  );
};
