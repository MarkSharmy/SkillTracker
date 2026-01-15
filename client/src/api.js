import axios from 'axios';

export const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Automatically attach JWT token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const fetchGoals = () => API.get('/goals');
export const createGoal = (goalData) => API.post('/goals', goalData);
export const toggleSubtask = (id) => API.patch(`/subtasks/${id}/toggle`);