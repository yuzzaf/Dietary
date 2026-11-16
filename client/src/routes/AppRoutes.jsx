import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import Loader from '../components/common/Loader';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Detect = lazy(() => import('../pages/food/Detect'));
const Search = lazy(() => import('../pages/food/Search'));
const Logs = lazy(() => import('../pages/logs/Logs'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

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
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
    </Suspense>
  );
};

export default AppRoutes;
