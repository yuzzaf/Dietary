import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const root = useRef(null);

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector('.forgot-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 800, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
        );
      }
    }
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading('Sending reset instruction...');
    try {
      const res = await forgotPassword(data.email);
      toast.success('Reset link sent!', { id: toastId });
      setIsSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={root}>
      <div className="forgot-container opacity-0 max-w-md mx-auto relative z-10 w-full px-4 sm:px-0 mt-8 sm:mt-12">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-tighter text-gray-900 hover:text-blue-600 transition group mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white transform group-hover:-rotate-12 transition duration-300 shadow-lg shadow-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            Dietary
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="mt-3 text-gray-500">Enter your email address to receive a password reset link.</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-white">
          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 ml-1 mb-2">Email Address</label>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })} 
                  className="block w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{errors.email.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 active:scale-[0.98]"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6 py-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 animate-bounce">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-gray-600 text-lg">Check your inbox for instructions to reset your password.</p>
            </div>
          )}

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link to="/login" className="font-bold text-gray-600 hover:text-gray-900 transition flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
