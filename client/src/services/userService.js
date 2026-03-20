import api from './api';

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.patch('/users/profile', userData);
  return response.data;
};

export const updateProfilePicture = async (formData) => {
  const response = await api.patch('/users/profile-picture', formData);
  return response.data;
};
