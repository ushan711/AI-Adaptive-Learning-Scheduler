import axios from 'axios';
import { auth } from './firebase';

// Add a type annotation for import.meta
interface ImportMeta {
  env: {
    VITE_API_BASE_URL: string;
  };
}

// Use Vite environment variable for the base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/ai-adaptive-learning-scheduler/us-central1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ✅ Request interceptor: Add Firebase auth token to all requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: Handle global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // This is a network or CORS error
      console.error('🌐 Network or server error. Please check your backend or internet connection.');
    } else if (error.response.status === 401) {
      console.error('🔐 Unauthorized access. User token may be missing or expired.');
    } else {
      console.error(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
    }
    return Promise.reject(error);
  }
);

//
// ✅ API Services
//

// Schedule APIs
export const scheduleAPI = {
  generateSchedule: async (preferences: any) => {
    if (!preferences || !preferences.subjects || preferences.subjects.length === 0) {
      throw new Error("❗ No subjects found in preferences. Add subjects before generating schedule.");
    }
    const response = await api.post('/api/schedule/generate', preferences);
    return response.data;
  },

  getUserSchedule: async (userId: string, date?: string) => {
    const response = await api.get(`/api/schedule/user/${userId}`, { params: { date } });
    return response.data;
  },

  updateScheduleBlock: async (sessionId: string, updates: any) => {
    const response = await api.put(`/api/schedule/session/${sessionId}`, updates);
    return response.data;
  },

  deleteScheduleBlock: async (sessionId: string) => {
    const response = await api.delete(`/api/schedule/session/${sessionId}`);
    return response.data;
  },
};

// Feedback APIs
export const feedbackAPI = {
  submitFeedback: async (feedbackData: any) => {
    const response = await api.post('/api/feedback', feedbackData);
    return response.data;
  },

  getFeedbackHistory: async (userId: string) => {
    const response = await api.get(`/api/feedback/user/${userId}`);
    return response.data;
  },
};

// Analytics APIs
export const analyticsAPI = {
  getWeeklyReport: async (userId: string, weekStart: string) => {
    const response = await api.get(`/api/analytics/weekly/${userId}`, {
      params: { weekStart },
    });
    return response.data;
  },

  getProgressStats: async (userId: string) => {
    const response = await api.get(`/api/analytics/progress/${userId}`);
    return response.data;
  },
};

// Subjects APIs
export const subjectsAPI = {
  getSubjects: async (userId: string) => {
    const response = await api.get(`/api/subjects/user/${userId}`);
    return response.data;
  },

  createSubject: async (subjectData: any) => {
    const response = await api.post('/api/subjects', subjectData);
    return response.data;
  },

  updateSubject: async (subjectId: string, updates: any) => {
    const response = await api.put(`/api/subjects/${subjectId}`, updates);
    return response.data;
  },

  deleteSubject: async (subjectId: string) => {
    const response = await api.delete(`/api/subjects/${subjectId}`);
    return response.data;
  },
};

export default api;
