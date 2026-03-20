import api from './api';

export const getInsight = async () => {
  const response = await api.get('/ai/insight');
  return response.data.data;
};

export const getWeeklyInsight = async () => {
  const response = await api.get('/ai/insight/weekly');
  return response.data.data;
};
