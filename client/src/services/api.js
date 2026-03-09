import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// إضافة التوكن تلقائياً لكل طلب
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

export default API;

export const getTransactions = () => API.get('/finance');
export const addTransaction = (data) => API.post('/finance', data);
export const deleteTransaction = (id) => API.delete(`/finance/${id}`);
export const getProjects = () => API.get('/projects');
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addTask = (projectId, data) => API.post(`/projects/${projectId}/tasks`, data);
export const updateTaskStatus = (projectId, taskId, status) => API.patch(`/projects/${projectId}/tasks/${taskId}`, { status });
export const deleteTask = (projectId, taskId) => API.delete(`/projects/${projectId}/tasks/${taskId}`);
export const getHabits = () => API.get('/habits');
export const createHabit = (data) => API.post('/habits', data);
export const toggleHabit = (id, date) => API.patch(`/habits/${id}/toggle`, { date });
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const getNotes    = ()           => API.get('/notes');
export const createNote  = (data)       => API.post('/notes', data);
export const updateNote  = (id, data)   => API.put(`/notes/${id}`, data);
export const deleteNote  = (id)         => API.delete(`/notes/${id}`);