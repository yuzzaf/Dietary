import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const baseURL = (rawBaseURL.startsWith('http://') || rawBaseURL.startsWith('https://'))
  ? rawBaseURL
  : `https://${rawBaseURL}`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
