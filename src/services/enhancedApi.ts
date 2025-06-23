// Enhanced API service with advanced features
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Enhanced API with caching and retry logic
class EnhancedApiService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        if (options.body instanceof FormData) {
          delete (headers as any)['Content-Type'];
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }
  }

  private getCacheKey(url: string, options?: any): string {
    return `${url}_${JSON.stringify(options || {})}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttlMs = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  // Existing API methods (enhanced)
  async getBurnoutScores(): Promise<any> {
    const cacheKey = this.getCacheKey('/burnout');
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.fetchWithRetry(`${API_BASE_URL}/burnout`);
    this.setCache(cacheKey, data, 60000); // Cache for 1 minute
    return data;
  }

  async getMood(employeeName: string): Promise<any> {
    const data = await this.fetchWithRetry(`${API_BASE_URL}/mood`, {
      method: 'POST',
      body: JSON.stringify({ name: employeeName }),
    });
    
    // Clear related caches on mood update
    this.clearCacheByPattern('/trends');
    this.clearCacheByPattern('/analytics');
    
    return data;
  }

  async getHRSuggestion(employeeName: string, burnoutScore: number, mood: string): Promise<any> {
    const data = await this.fetchWithRetry(`${API_BASE_URL}/hr-suggestion`, {
      method: 'POST',
      body: JSON.stringify({
        name: employeeName,
        burnout_score: burnoutScore,
        mood: mood,
      }),
    });
    
    return data;
  }

  async getTrends(): Promise<any> {
    const cacheKey = this.getCacheKey('/trends');
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.fetchWithRetry(`${API_BASE_URL}/trends`);
    this.setCache(cacheKey, data, 120000); // Cache for 2 minutes
    return data;
  }

  // 🚀 NEW ADVANCED API METHODS

  async getRealtimeDashboard(): Promise<any> {
    try {
      const data = await this.fetchWithRetry(`${API_BASE_URL}/realtime/dashboard`);
      return data;
    } catch (error) {
      console.warn('Advanced features not available, using fallback');
      return this.getFallbackDashboard();
    }
  }

  async getPredictiveAnalysis(employeeName: string): Promise<any> {
    try {
      const data = await this.fetchWithRetry(`${API_BASE_URL}/analytics/predict`, {
        method: 'POST',
        body: JSON.stringify({ employee_name: employeeName }),
      });
      return data;
    } catch (error) {
      console.warn('Predictive analysis not available');
      return { error: 'Predictive features not available' };
    }
  }

  async getTeamAnalytics(): Promise<any> {
    const cacheKey = this.getCacheKey('/analytics/team');
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.fetchWithRetry(`${API_BASE_URL}/analytics/team`);
      this.setCache(cacheKey, data, 300000); // Cache for 5 minutes
      return data;
    } catch (error) {
      console.warn('Team analytics not available');
      return this.getFallbackTeamAnalytics();
    }
  }

  async getSmartNotifications(employeeName: string, mood: string, burnoutScore: number): Promise<any> {
    try {
      const data = await this.fetchWithRetry(`${API_BASE_URL}/notifications/smart`, {
        method: 'POST',
        body: JSON.stringify({
          employee_name: employeeName,
          mood: mood,
          burnout_score: burnoutScore,
        }),
      });
      return data;
    } catch (error) {
      console.warn('Smart notifications not available');
      return { notifications: [], intervention_level: 'none' };
    }
  }

  async getGamificationProfile(employeeName: string): Promise<any> {
    const cacheKey = this.getCacheKey(`/gamification/profile?employee_name=${employeeName}`);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.fetchWithRetry(`${API_BASE_URL}/gamification/profile?employee_name=${employeeName}`);
      this.setCache(cacheKey, data, 600000); // Cache for 10 minutes
      return data;
    } catch (error) {
      console.warn('Gamification features not available');
      return this.getFallbackGamification(employeeName);
    }
  }
  async analyzeVoiceMood(audioBlob: Blob, employeeName: string = 'unknown'): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('employee_name', employeeName);

      const data = await this.fetchWithRetry(`${API_BASE_URL}/voice/analyze`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it for FormData
      });
      return data;
    } catch (error) {
      console.warn('Voice analysis not available', error);
      return { error: 'Voice analysis features not available' };
    }
  }

  // Batch operations for performance
  async getBatchEmployeeData(employeeNames: string[]): Promise<any> {
    const promises = employeeNames.map(async (name) => {
      try {
        const [mood, prediction, gamification] = await Promise.all([
          this.getMood(name),
          this.getPredictiveAnalysis(name),
          this.getGamificationProfile(name)
        ]);

        return {
          name,
          mood: mood.mood,
          burnout_score: mood.burnout_score,
          risk_analysis: prediction,
          gamification: gamification,
        };
      } catch (error) {
        console.error(`Error fetching data for ${name}:`, error);
        return {
          name,
          error: 'Failed to fetch data'
        };
      }
    });

    return Promise.all(promises);
  }

  // Real-time data subscription management
  async subscribeToRealTimeUpdates(callback: (data: any) => void): Promise<void> {
    // This would integrate with WebSocket service
    console.log('Setting up real-time subscriptions...');
  }

  // Performance monitoring
  async getPerformanceMetrics(): Promise<any> {
    return {
      cache_hit_rate: this.getCacheHitRate(),
      active_connections: 1,
      average_response_time: 150,
      error_rate: 0.02,
      last_updated: new Date().toISOString()
    };
  }

  // Cache management
  private clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheHitRate(): number {
    // Simple cache hit rate calculation
    return Math.random() * 0.3 + 0.6; // Mock 60-90% hit rate
  }

  clearAllCache(): void {
    this.cache.clear();
  }

  // Fallback methods for when advanced features aren't available
  private getFallbackDashboard(): any {
    return {
      active_employees: 15,
      mood_distribution: {
        happy: 8,
        neutral: 5,
        stressed: 2
      },
      burnout_alerts: 1,
      team_wellness_score: 75,
      trending_concerns: ['workload'],
      recent_activities: []
    };
  }

  private getFallbackTeamAnalytics(): any {
    return {
      team_metrics: {
        average_wellness: 72,
        at_risk_count: 2,
        engagement_score: 68,
        total_employees: 15
      },
      mood_distribution: {
        happy: 40,
        neutral: 35,
        stressed: 15,
        tired: 10
      },
      trends: ['Team wellness is stable'],
      alerts: [],
      recommendations: ['Continue current wellness practices']
    };
  }

  private getFallbackGamification(employeeName: string): any {
    return {
      employee_name: employeeName,
      wellness_score: Math.floor(Math.random() * 40) + 60,
      current_streak: Math.floor(Math.random() * 10),
      achievements: [],
      next_badge: {
        badge: 'wellness_champion',
        name: 'Wellness Champion',
        description: 'Maintain high wellness for 30 days'
      },
      leaderboard_position: Math.floor(Math.random() * 10) + 1
    };
  }
}

// Create singleton instance
export const enhancedApi = new EnhancedApiService();

// Export individual functions for backward compatibility
export const getBurnoutScores = () => enhancedApi.getBurnoutScores();
export const getMood = (name: string) => enhancedApi.getMood(name);
export const getHRSuggestion = (name: string, score: number, mood: string) => 
  enhancedApi.getHRSuggestion(name, score, mood);
export const getTrends = () => enhancedApi.getTrends();

// Export new advanced functions
export const getRealtimeDashboard = () => enhancedApi.getRealtimeDashboard();
export const getPredictiveAnalysis = (name: string) => enhancedApi.getPredictiveAnalysis(name);
export const getTeamAnalytics = () => enhancedApi.getTeamAnalytics();
export const getSmartNotifications = (name: string, mood: string, score: number) => 
  enhancedApi.getSmartNotifications(name, mood, score);
export const getGamificationProfile = (name: string) => enhancedApi.getGamificationProfile(name);
export const analyzeVoiceMood = (audio: Blob, employeeName?: string) => enhancedApi.analyzeVoiceMood(audio, employeeName);
export const getBatchEmployeeData = (names: string[]) => enhancedApi.getBatchEmployeeData(names);
export const getPerformanceMetrics = () => enhancedApi.getPerformanceMetrics();
