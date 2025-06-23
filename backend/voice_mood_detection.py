# Voice Mood Detection using Audio Analysis
import numpy as np
import librosa
import scipy.signal
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class VoiceMoodDetector:
    """Advanced voice-based mood detection using audio feature analysis"""
    
    def __init__(self):
        self.mood_features = {
            'happy': {
                'pitch_range': (150, 300),
                'energy_threshold': 0.6,
                'spectral_centroid_range': (2000, 4000),
                'speaking_rate_range': (4.5, 6.0)  # syllables per second
            },
            'sad': {
                'pitch_range': (80, 150),
                'energy_threshold': 0.3,
                'spectral_centroid_range': (1000, 2500),
                'speaking_rate_range': (2.0, 3.5)
            },
            'angry': {
                'pitch_range': (200, 400),
                'energy_threshold': 0.8,
                'spectral_centroid_range': (3000, 6000),
                'speaking_rate_range': (5.0, 7.0)
            },
            'stressed': {
                'pitch_range': (180, 350),
                'energy_threshold': 0.5,
                'spectral_centroid_range': (2500, 5000),
                'speaking_rate_range': (4.0, 6.5)
            },
            'calm': {
                'pitch_range': (100, 180),
                'energy_threshold': 0.4,
                'spectral_centroid_range': (1500, 3000),
                'speaking_rate_range': (3.0, 4.5)
            },
            'neutral': {
                'pitch_range': (120, 200),
                'energy_threshold': 0.5,
                'spectral_centroid_range': (2000, 3500),
                'speaking_rate_range': (3.5, 5.0)
            }
        }
    
    def analyze_audio_features(self, audio_file_path: str) -> Dict:
        """Extract comprehensive audio features from voice recording"""
        try:
            # Load audio file
            y, sr = librosa.load(audio_file_path, sr=22050)
            
            # Extract features
            features = {}
            
            # 1. Pitch (Fundamental frequency)
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr, threshold=0.1)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            features['avg_pitch'] = np.mean(pitch_values) if pitch_values else 0
            features['pitch_std'] = np.std(pitch_values) if pitch_values else 0
            
            # 2. Energy/Intensity
            rms = librosa.feature.rms(y=y)[0]
            features['avg_energy'] = np.mean(rms)
            features['energy_std'] = np.std(rms)
            
            # 3. Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            features['avg_spectral_centroid'] = np.mean(spectral_centroids)
            
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
            features['avg_spectral_bandwidth'] = np.mean(spectral_bandwidth)
            
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            features['avg_spectral_rolloff'] = np.mean(spectral_rolloff)
            
            # 4. MFCCs (Mel-frequency cepstral coefficients)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            for i in range(13):
                features[f'mfcc_{i}'] = np.mean(mfccs[i])
            
            # 5. Zero crossing rate (related to voicing)
            zcr = librosa.feature.zero_crossing_rate(y)[0]
            features['avg_zcr'] = np.mean(zcr)
            
            # 6. Tempo and rhythm
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            features['tempo'] = tempo
            
            # 7. Duration and speaking rate estimation
            duration = len(y) / sr
            features['duration'] = duration
            
            # Estimate speaking rate (simplified)
            features['estimated_speaking_rate'] = self._estimate_speaking_rate(y, sr)
            
            # 8. Jitter and shimmer (voice quality measures)
            features['jitter'] = self._calculate_jitter(pitch_values)
            features['shimmer'] = self._calculate_shimmer(rms)
            
            return features
            
        except Exception as e:
            print(f"Error extracting audio features: {e}")
            return {}
    
    def predict_mood_from_features(self, features: Dict) -> Dict:
        """Predict mood based on extracted audio features"""
        if not features:
            return {'mood': 'neutral', 'confidence': 0.0, 'scores': {}}
        
        mood_scores = {}
        
        for mood, criteria in self.mood_features.items():
            score = 0.0
            total_weight = 0.0
            
            # Pitch score
            if 'avg_pitch' in features and features['avg_pitch'] > 0:
                pitch_score = self._score_in_range(
                    features['avg_pitch'], 
                    criteria['pitch_range']
                )
                score += pitch_score * 0.25
                total_weight += 0.25
            
            # Energy score
            if 'avg_energy' in features:
                energy_diff = abs(features['avg_energy'] - criteria['energy_threshold'])
                energy_score = max(0, 1 - energy_diff * 2)
                score += energy_score * 0.25
                total_weight += 0.25
            
            # Spectral centroid score
            if 'avg_spectral_centroid' in features:
                spectral_score = self._score_in_range(
                    features['avg_spectral_centroid'],
                    criteria['spectral_centroid_range']
                )
                score += spectral_score * 0.20
                total_weight += 0.20
            
            # Speaking rate score
            if 'estimated_speaking_rate' in features:
                rate_score = self._score_in_range(
                    features['estimated_speaking_rate'],
                    criteria['speaking_rate_range']
                )
                score += rate_score * 0.15
                total_weight += 0.15
            
            # Additional features
            if 'pitch_std' in features:
                # Higher pitch variation often indicates emotional states
                if mood in ['angry', 'stressed']:
                    variation_score = min(1.0, features['pitch_std'] / 50)
                else:
                    variation_score = max(0, 1 - features['pitch_std'] / 50)
                score += variation_score * 0.15
                total_weight += 0.15
            
            # Normalize score
            if total_weight > 0:
                mood_scores[mood] = score / total_weight
            else:
                mood_scores[mood] = 0.0
        
        # Find best matching mood
        best_mood = max(mood_scores.items(), key=lambda x: x[1])
        
        return {
            'mood': best_mood[0],
            'confidence': round(best_mood[1], 3),
            'scores': {k: round(v, 3) for k, v in mood_scores.items()},
            'features_used': list(features.keys())
        }
    
    def _score_in_range(self, value: float, range_tuple: Tuple[float, float]) -> float:
        """Score how well a value fits within a range (0-1)"""
        min_val, max_val = range_tuple
        if min_val <= value <= max_val:
            # Perfect fit
            return 1.0
        elif value < min_val:
            # Below range
            distance = min_val - value
            return max(0, 1 - distance / min_val)
        else:
            # Above range
            distance = value - max_val
            return max(0, 1 - distance / max_val)
    
    def _estimate_speaking_rate(self, y: np.ndarray, sr: int) -> float:
        """Estimate speaking rate in syllables per second"""
        # Simplified syllable detection based on energy peaks
        try:
            # Apply bandpass filter to focus on speech frequencies
            filtered = scipy.signal.butter(4, [300, 3400], btype='band', fs=sr, output='sos')
            y_filtered = scipy.signal.sosfilt(filtered, y)
            
            # Calculate energy envelope
            frame_length = int(0.025 * sr)  # 25ms frames
            hop_length = int(0.010 * sr)    # 10ms hop
            
            energy = []
            for i in range(0, len(y_filtered) - frame_length, hop_length):
                frame = y_filtered[i:i + frame_length]
                energy.append(np.sum(frame ** 2))
            
            energy = np.array(energy)
            
            # Find peaks (potential syllable nuclei)
            threshold = np.mean(energy) * 0.5
            peaks, _ = scipy.signal.find_peaks(energy, height=threshold, distance=10)
            
            # Calculate speaking rate
            duration = len(y) / sr
            syllable_count = len(peaks)
            speaking_rate = syllable_count / duration if duration > 0 else 0
            
            return speaking_rate
            
        except Exception as e:
            print(f"Error estimating speaking rate: {e}")
            return 3.5  # Default average speaking rate
    
    def _calculate_jitter(self, pitch_values: List[float]) -> float:
        """Calculate pitch jitter (period-to-period variation)"""
        if len(pitch_values) < 2:
            return 0.0
        
        try:
            periods = [1/p if p > 0 else 0 for p in pitch_values]
            if len(periods) < 2:
                return 0.0
            
            period_diffs = []
            for i in range(1, len(periods)):
                if periods[i] > 0 and periods[i-1] > 0:
                    diff = abs(periods[i] - periods[i-1])
                    period_diffs.append(diff)
            
            if period_diffs:
                jitter = np.mean(period_diffs) / np.mean([p for p in periods if p > 0])
                return min(jitter, 1.0)  # Cap at 1.0
            
            return 0.0
            
        except Exception:
            return 0.0
    
    def _calculate_shimmer(self, rms_values: np.ndarray) -> float:
        """Calculate amplitude shimmer (amplitude variation)"""
        if len(rms_values) < 2:
            return 0.0
        
        try:
            amp_diffs = []
            for i in range(1, len(rms_values)):
                if rms_values[i] > 0 and rms_values[i-1] > 0:
                    diff = abs(rms_values[i] - rms_values[i-1])
                    amp_diffs.append(diff)
            
            if amp_diffs:
                shimmer = np.mean(amp_diffs) / np.mean(rms_values)
                return min(shimmer, 1.0)  # Cap at 1.0
            
            return 0.0
            
        except Exception:
            return 0.0
    
    def analyze_audio_stream(self, audio_data: np.ndarray, sr: int = 22050) -> Dict:
        """Analyze mood from real-time audio stream data"""
        try:
            # Similar to analyze_audio_features but for streaming data
            features = {}
            
            # Basic features for real-time analysis
            rms = np.sqrt(np.mean(audio_data ** 2))
            features['avg_energy'] = rms
            
            # Simple pitch estimation using autocorrelation
            correlation = np.correlate(audio_data, audio_data, mode='full')
            correlation = correlation[correlation.size // 2:]
            
            # Find the first peak after the zero lag
            if len(correlation) > 100:
                peaks, _ = scipy.signal.find_peaks(correlation[50:], height=0.3 * np.max(correlation))
                if len(peaks) > 0:
                    period = peaks[0] + 50
                    features['avg_pitch'] = sr / period
                else:
                    features['avg_pitch'] = 0
            else:
                features['avg_pitch'] = 0
            
            # Spectral centroid
            fft = np.abs(np.fft.rfft(audio_data))
            freqs = np.fft.rfftfreq(len(audio_data), 1/sr)
            
            if np.sum(fft) > 0:
                features['avg_spectral_centroid'] = np.sum(freqs * fft) / np.sum(fft)
            else:
                features['avg_spectral_centroid'] = 0
            
            # Estimate speaking rate (simplified for real-time)
            duration = len(audio_data) / sr
            features['duration'] = duration
            features['estimated_speaking_rate'] = 4.0  # Default for real-time
            
            return self.predict_mood_from_features(features)
            
        except Exception as e:
            print(f"Error analyzing audio stream: {e}")
            return {'mood': 'neutral', 'confidence': 0.0}

class VoiceWellnessAnalyzer:
    """Analyze voice patterns for wellness indicators"""
    
    def __init__(self):
        self.voice_detector = VoiceMoodDetector()
        self.baseline_features = {}
    
    def set_baseline(self, audio_file_path: str, employee_name: str):
        """Set baseline voice characteristics for an employee"""
        features = self.voice_detector.analyze_audio_features(audio_file_path)
        self.baseline_features[employee_name] = features
    
    def analyze_wellness_indicators(self, audio_file_path: str, employee_name: str) -> Dict:
        """Analyze voice for wellness indicators compared to baseline"""
        current_features = self.voice_detector.analyze_audio_features(audio_file_path)
        
        if not current_features:
            return {'status': 'error', 'message': 'Could not analyze audio'}
        
        # Get mood prediction
        mood_result = self.voice_detector.predict_mood_from_features(current_features)
        
        wellness_indicators = {
            'mood_analysis': mood_result,
            'voice_quality': self._analyze_voice_quality(current_features),
            'stress_indicators': self._detect_stress_indicators(current_features),
            'fatigue_indicators': self._detect_fatigue_indicators(current_features)
        }
        
        # Compare with baseline if available
        if employee_name in self.baseline_features:
            baseline = self.baseline_features[employee_name]
            wellness_indicators['baseline_comparison'] = self._compare_with_baseline(
                current_features, baseline
            )
        
        return wellness_indicators
    
    def _analyze_voice_quality(self, features: Dict) -> Dict:
        """Analyze voice quality indicators"""
        quality_score = 1.0
        indicators = []
        
        # Check jitter (pitch instability)
        if 'jitter' in features and features['jitter'] > 0.02:
            quality_score -= 0.2
            indicators.append('High pitch instability detected')
        
        # Check shimmer (amplitude instability)
        if 'shimmer' in features and features['shimmer'] > 0.1:
            quality_score -= 0.2
            indicators.append('Voice amplitude instability detected')
        
        # Check pitch range
        if 'pitch_std' in features and features['pitch_std'] < 10:
            quality_score -= 0.1
            indicators.append('Limited pitch variation (possible monotone speech)')
        
        return {
            'quality_score': max(0, quality_score),
            'indicators': indicators,
            'voice_stability': 'good' if quality_score > 0.7 else 'concerning' if quality_score > 0.4 else 'poor'
        }
    
    def _detect_stress_indicators(self, features: Dict) -> Dict:
        """Detect voice-based stress indicators"""
        stress_score = 0.0
        indicators = []
        
        # High pitch (stress indicator)
        if 'avg_pitch' in features and features['avg_pitch'] > 250:
            stress_score += 0.3
            indicators.append('Elevated vocal pitch')
        
        # High energy/intensity
        if 'avg_energy' in features and features['avg_energy'] > 0.7:
            stress_score += 0.2
            indicators.append('High vocal intensity')
        
        # Fast speaking rate
        if 'estimated_speaking_rate' in features and features['estimated_speaking_rate'] > 6:
            stress_score += 0.2
            indicators.append('Rapid speech rate')
        
        # High pitch variation
        if 'pitch_std' in features and features['pitch_std'] > 40:
            stress_score += 0.2
            indicators.append('High pitch variation')
        
        # High jitter
        if 'jitter' in features and features['jitter'] > 0.03:
            stress_score += 0.1
            indicators.append('Voice instability')
        
        return {
            'stress_level': min(1.0, stress_score),
            'indicators': indicators,
            'assessment': 'high' if stress_score > 0.6 else 'moderate' if stress_score > 0.3 else 'low'
        }
    
    def _detect_fatigue_indicators(self, features: Dict) -> Dict:
        """Detect voice-based fatigue indicators"""
        fatigue_score = 0.0
        indicators = []
        
        # Low energy
        if 'avg_energy' in features and features['avg_energy'] < 0.3:
            fatigue_score += 0.3
            indicators.append('Low vocal energy')
        
        # Slow speaking rate
        if 'estimated_speaking_rate' in features and features['estimated_speaking_rate'] < 2.5:
            fatigue_score += 0.2
            indicators.append('Slow speech rate')
        
        # Low pitch
        if 'avg_pitch' in features and features['avg_pitch'] < 100:
            fatigue_score += 0.2
            indicators.append('Low vocal pitch')
        
        # Low pitch variation
        if 'pitch_std' in features and features['pitch_std'] < 15:
            fatigue_score += 0.2
            indicators.append('Monotone speech pattern')
        
        # High shimmer (voice weakness)
        if 'shimmer' in features and features['shimmer'] > 0.08:
            fatigue_score += 0.1
            indicators.append('Voice weakness detected')
        
        return {
            'fatigue_level': min(1.0, fatigue_score),
            'indicators': indicators,
            'assessment': 'high' if fatigue_score > 0.6 else 'moderate' if fatigue_score > 0.3 else 'low'
        }
    
    def _compare_with_baseline(self, current: Dict, baseline: Dict) -> Dict:
        """Compare current voice features with baseline"""
        changes = {}
        
        key_features = ['avg_pitch', 'avg_energy', 'estimated_speaking_rate', 'jitter', 'shimmer']
        
        for feature in key_features:
            if feature in current and feature in baseline:
                current_val = current[feature]
                baseline_val = baseline[feature]
                
                if baseline_val > 0:
                    change_percent = ((current_val - baseline_val) / baseline_val) * 100
                    changes[feature] = {
                        'change_percent': round(change_percent, 1),
                        'current': round(current_val, 3),
                        'baseline': round(baseline_val, 3),
                        'status': 'increased' if change_percent > 5 else 'decreased' if change_percent < -5 else 'stable'
                    }
        
        return changes

# Factory function
def create_voice_detector():
    """Create voice mood detector instance"""
    return VoiceMoodDetector()

def create_voice_wellness_analyzer():
    """Create voice wellness analyzer instance"""
    return VoiceWellnessAnalyzer()

# Alias for backward compatibility
VoiceMoodAnalyzer = VoiceWellnessAnalyzer

# Example usage
if __name__ == "__main__":
    # Test voice mood detection
    detector = VoiceMoodDetector()
    
    # Note: This would require actual audio files to test
    print("Voice Mood Detector initialized successfully!")
    print("Available mood categories:", list(detector.mood_features.keys()))
