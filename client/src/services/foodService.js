import api from './api';

export const searchFood = async (query) => {
  const response = await api.get(`/foods/search?q=${query}`);
  // Mapping to return just the array of food options
  return response.data.data?.options || [];
};

export const getFoodDetail = async (id) => {
  const response = await api.get(`/foods/${id}`);
  return response.data.data;
};

export const detectFoodImage = async (formData) => {
  const response = await api.post('/foods/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};
