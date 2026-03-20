import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Detect from '../pages/food/Detect';
import Search from '../pages/food/Search';
import Logs from '../pages/logs/Logs';
import Profile from '../pages/profile/Profile';
import NotFound from '../pages/NotFound';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>
      
      <Route element={<MainLayout />}>
        {/* Core features accessible to everyone */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/detect" element={<Detect />} />
        <Route path="/search" element={<Search />} />
        
        {/* Strictly personal data protected by login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/logs" element={<Logs />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
