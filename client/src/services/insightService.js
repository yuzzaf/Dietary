import api from './api';

export const getInsight = async () => {
  const response = await api.get('/ai/insight');
  return response.data.data;
};

export const getWeeklyInsight = async () => {
  const response = await api.get('/ai/insight/weekly');
  return response.data;
};

export const sendChatMessage = async (message, history, socketId) => {
  const response = await api.post('/ai/chat', { message, history, socketId });
  return response.data;
};

export const exportWeeklyInsightPdf = async () => {
  const response = await api.get('/ai/insight/export', { responseType: 'blob' });
  return response.data;
};
