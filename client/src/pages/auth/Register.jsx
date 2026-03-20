import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { animate, stagger, createScope } from 'animejs';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    scope.current = createScope({ root: root.current }).add(() => {
      animate('.register-container', {
        translateY: [20, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 500
      });
      
      animate('.form-group', {
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: stagger(100, { start: 200 }),
        easing: 'easeOutQuad',
        duration: 500
      });
    });

    return () => scope.current.revert();
  }, []);

  const onSubmit = async (data) => {
    const toastId = toast.loading('Creating account...');
    try {
      await registerUser(data);
      toast.success('Registration successful! Please login.', { id: toastId });
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div ref={root}>
      <div className="register-container opacity-0">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">Create new account</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-group opacity-0">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input 
            type="text" 
            {...register('username', { required: 'Username is required' })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>
        <div className="form-group opacity-0">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            {...register('email', { required: 'Email is required' })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div className="form-group opacity-0">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button 
          type="submit" 
          className="form-group opacity-0 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Register
        </button>
      </form>

      {/* Divider */}
      <div className="relative mb-6 text-center mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <span className="relative px-2 bg-white text-sm text-gray-500">Or continue with</span>
      </div>

      {/* GitHub Register Button */}
      <button
        onClick={() => {
          window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=user:email`;
        }}
        type="button"
        className="form-group opacity-0 w-full mb-6 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition"
      >
        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
        Sign up with GitHub
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Register;
