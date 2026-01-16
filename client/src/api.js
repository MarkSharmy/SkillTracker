import axios from 'axios';

export const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// This "Interceptor" runs before every single request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchGoals = () => API.get('/goals');
export const createGoal = (goalData) => API.post('/goals', goalData);
export const toggleSubtask = (id) => API.patch(`/subtasks/${id}/toggle`);