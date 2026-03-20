import api from './api';

export const getGoal = async () => {
  const response = await api.get('/goals');
  return response.data;
};

export const upsertGoal = async (goalData) => {
  const response = await api.post('/goals', goalData);
  return response.data;
};
