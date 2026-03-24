import api from './api';

export const getLogs = async () => {
  const response = await api.get('/logs');
  return response.data.data;
};

export const getLogsToday = async () => {
  const response = await api.get('/logs/today');
  return response.data.data;
};

export const createLog = async (logData) => {
  const response = await api.post('/logs', logData);
  return response.data.data;
};

export const deleteLog = async (id) => {
  const response = await api.delete(`/logs/${id}`);
  return response.data;
};
