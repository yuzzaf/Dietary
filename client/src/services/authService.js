import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const googleLogin = async (id_token) => {
  const response = await api.post('/auth/google-login', { id_token });
  return response.data;
};

export const githubLogin = async (code) => {
  const response = await api.post('/auth/github-login', { code });
  return response.data;
};
