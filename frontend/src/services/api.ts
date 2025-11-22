import axios from 'axios';

// Handle both Vite's import.meta.env and Jest test environment
let API_URL: string;
try {
  // Try to use Vite's import.meta.env (works in browser/Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    API_URL = import.meta.env.VITE_API_URL;
  } else {
    API_URL = 'http://localhost:5000/api';
  }
} catch {
  // Fallback for Jest tests or environments without import.meta
  API_URL = (process.env.VITE_API_URL as string) || 'http://localhost:5000/api';
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

// Task API
export const taskAPI = {
  getTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },
  createTask: async (task: { title: string; description?: string; status: 'pending' | 'completed' }) => {
    const response = await api.post('/tasks', task);
    return response.data;
  },
  updateTask: async (id: string, task: { title?: string; description?: string; status?: 'pending' | 'completed' }) => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  updateProfile: async (profile: { email?: string; firstName?: string; lastName?: string; bio?: string; avatar?: string }) => {
    const response = await api.put('/profile', profile);
    return response.data;
  },
  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await api.post('/profile/change-password', passwords);
    return response.data;
  },
};

export default api;

