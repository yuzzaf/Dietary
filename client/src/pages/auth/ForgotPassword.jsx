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
          [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
        );
      }
    }
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading('Sending reset instruction...');
    try {
      await forgotPassword(data.email);
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
      <div className="forgot-container opacity-0 bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_28px_-6px_rgba(0,0,0,0.06)] p-7 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-10 h-10 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Forgot password?</h1>
          <p className="text-xs text-zinc-500 mt-1">Enter your email and we'll send you instructions to reset it</p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })} 
                className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
              {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? 'Sending instructions...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-zinc-900">Check your inbox</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
              We have dispatched a password recovery link to your email address. Please follow the link to continue.
            </p>
          </div>
        )}

        {/* Footer Back link */}
        <div className="mt-6 text-center pt-5 border-t border-zinc-100">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
