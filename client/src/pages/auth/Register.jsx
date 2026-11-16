import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const root = useRef(null);

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector('.register-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
        );
      }
    }
  }, []);

  const onSubmit = async (data) => {
    const toastId = toast.loading('Creating account...');
    try {
      await registerUser(data);
      toast.success('Registration successful! Please sign in.', { id: toastId });
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div ref={root}>
      <div className="register-container opacity-0 bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_28px_-6px_rgba(0,0,0,0.06)] p-7 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create an account</h1>
          <p className="text-xs text-zinc-500 mt-1">Start tracking your nutrition and achieving your goals</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">First name</label>
              <input 
                type="text" 
                placeholder="John"
                {...register('firstName', { required: 'First name is required' })} 
                className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
              {errors.firstName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Last name</label>
              <input 
                type="text" 
                placeholder="Doe"
                {...register('lastName', { required: 'Last name is required' })} 
                className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
              {errors.lastName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Password</label>
            <input 
              type="password" 
              placeholder="Min. 6 characters"
              {...register('password', { 
                required: 'Password is required', 
                minLength: { value: 6, message: 'Password must be at least 6 characters' } 
              })} 
              className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
            />
            {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200/80"></div>
          </div>
          <span className="relative px-3 bg-white text-[11px] font-medium tracking-wider uppercase text-zinc-400">
            or continue with
          </span>
        </div>

        {/* GitHub Register Button */}
        <div className="w-full max-w-[280px] mx-auto">
          <button
            onClick={() => {
              window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=user:email`;
            }}
            type="button"
            className="w-full h-[40px] flex justify-center items-center py-2 px-4 border border-zinc-200 rounded-full shadow-sm text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50/80 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-all active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2.5 text-zinc-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Sign up with GitHub
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center pt-5 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
