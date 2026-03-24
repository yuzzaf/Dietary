import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { login, googleLogin, githubLogin } from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  const root = useRef(null);
  const githubAttempted = useRef(false);

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector('.login-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 800, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
        );
      }
    }
  }, []);

  useEffect(() => {
    if (code && !githubAttempted.current) {
      githubAttempted.current = true; // Kunci supaya React StrictMode tidak jalan 2x
      
      const handleGithubOAuth = async () => {
        const toastId = toast.loading('Authenticating with GitHub...');
        try {
          // Hapus `?code=xxx` dari address bar supaya tidak kepanggil lagi kalau user refresh
          window.history.replaceState({}, document.title, '/login');

          const result = await githubLogin(code);
          dispatch(setCredentials({ token: result.access_token }));
          toast.success('GitHub Login successful!', { id: toastId });
          navigate('/', { replace: true });
        } catch (error) {
          const message = error.response?.data?.message || 'GitHub Login failed';
          toast.error(message, { id: toastId });
        }
      };
      handleGithubOAuth();
    }
  }, [code, dispatch, navigate]);

  const onSubmit = async (data) => {
    const toastId = toast.loading('Logging in...');
    try {
      const result = await login(data);
      dispatch(setCredentials({ token: result.access_token }));
      toast.success('Login successful!', { id: toastId });
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message, { id: toastId });
    }
  };

  const handleGoogleSuccess = async (response) => {
    const toastId = toast.loading('Authenticating with Google...');
    try {
      const result = await googleLogin(response.credential);
      dispatch(setCredentials({ token: result.access_token }));
      toast.success('Google Login successful!', { id: toastId });
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Google Login failed';
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div ref={root}>
      <div className="login-container opacity-0">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">Sign in to your account</h2>
      
      {/* Standard Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            {...register('email', { required: 'Email is required' })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            {...register('password', { required: 'Password is required' })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button 
          type="submit" 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="relative mb-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <span className="relative px-2 bg-white text-sm text-gray-500">Or continue with</span>
      </div>

      {/* Google Login Button */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Login encountered an error')}
            useOneTap
            theme="outline"
            shape="pill"
          />
        </div>
        
        <button
          onClick={() => {
            window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=user:email`;
          }}
          type="button"
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition"
        >
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          Continue with GitHub
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;
