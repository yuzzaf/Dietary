import dayjs from 'dayjs';

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

export const formatTime = (date) => {
  return dayjs(date).format('HH:mm');
};
