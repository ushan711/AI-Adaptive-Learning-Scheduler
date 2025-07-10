import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Schedule API calls
export const scheduleAPI = {
  generateSchedule: async (preferences: any) => {
    const response = await api.post('/api/schedule/generate', preferences);
    return response.data;
  },
  
  getUserSchedule: async (userId: string, date?: string) => {
    const response = await api.get(`/api/schedule/user/${userId}`, {
      params: { date },
    });
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

// Feedback API calls
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

// Analytics API calls
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

// Subjects API calls
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