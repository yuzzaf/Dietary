import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  
  return {
    isAuthenticated,
    token
  };
};
