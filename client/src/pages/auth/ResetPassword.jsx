import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const root = useRef(null);

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector('.reset-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 800, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
        );
      }
    }
  }, []);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing password reset token!');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Reseting password...');
    try {
      await resetPassword(token, data.password);
      toast.success('Password successfully reset! You can now login.', { id: toastId });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const newPassword = watch('password');

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Invalid Link</h2>
        <p className="mt-4 text-gray-500 max-w-md">The password reset link is invalid or has expired. Please request a new one.</p>
        <Link to="/forgot-password" className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-200">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div ref={root}>
      <div className="reset-container opacity-0 max-w-md mx-auto relative z-10 w-full px-4 sm:px-0 mt-8 sm:mt-12">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tighter text-gray-900 hover:text-blue-600 transition group mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white transform group-hover:-rotate-12 transition duration-300 shadow-lg shadow-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            Dietary
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Password</h2>
          <p className="mt-3 text-gray-500">Choose a strong, new password for your account.</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2">New Password</label>
              <input 
                type="password" 
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })} 
                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2">Confirm Password</label>
              <input 
                type="password" 
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })} 
                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? 'Reseting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
