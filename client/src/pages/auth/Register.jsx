import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '../../services/authService';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Register = () => {
  const { lang } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const root = useRef(null);

  const t = {
    title: lang === 'id' ? 'Buat Akun Baru' : 'Create an account',
    subtitle: lang === 'id' ? 'Mulai pantau nutrisi harian dan raih target kesehatan Anda' : 'Start tracking your nutrition and achieving your goals',
    firstName: lang === 'id' ? 'Nama Depan' : 'First name',
    firstNameReq: lang === 'id' ? 'Nama depan wajib diisi' : 'First name is required',
    lastName: lang === 'id' ? 'Nama Belakang' : 'Last name',
    lastNameReq: lang === 'id' ? 'Nama belakang wajib diisi' : 'Last name is required',
    email: lang === 'id' ? 'Alamat Email' : 'Email address',
    emailReq: lang === 'id' ? 'Email wajib diisi' : 'Email is required',
    password: lang === 'id' ? 'Kata Sandi' : 'Password',
    passReq: lang === 'id' ? 'Kata sandi wajib diisi' : 'Password is required',
    passMin: lang === 'id' ? 'Kata sandi minimal 6 karakter' : 'Password must be at least 6 characters',
    passPlaceholder: lang === 'id' ? 'Min. 6 karakter' : 'Min. 6 characters',
    createBtn: lang === 'id' ? 'Buat Akun' : 'Create Account',
    hasAccount: lang === 'id' ? 'Sudah memiliki akun?' : 'Already have an account?',
    signIn: lang === 'id' ? 'Masuk di sini' : 'Sign in',
    creating: lang === 'id' ? 'Membuat akun...' : 'Creating account...',
    regSuccess: lang === 'id' ? 'Pendaftaran berhasil! Silakan masuk.' : 'Registration successful! Please sign in.',
    regFailed: lang === 'id' ? 'Pendaftaran gagal' : 'Registration failed',
  };

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
    const toastId = toast.loading(t.creating);
    try {
      await registerUser(data);
      toast.success(t.regSuccess, { id: toastId });
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || t.regFailed;
      toast.error(message, { id: toastId });
    }
  };

  return (
    <div ref={root}>
      <div className="register-container opacity-0 bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_12px_28px_-6px_rgba(0,0,0,0.06)] p-7 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t.title}</h1>
          <p className="text-xs text-zinc-500 mt-1">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.firstName}</label>
              <input 
                type="text" 
                placeholder="John"
                {...register('firstName', { required: t.firstNameReq })} 
                className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
              {errors.firstName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.lastName}</label>
              <input 
                type="text" 
                placeholder="Doe"
                {...register('lastName', { required: t.lastNameReq })} 
                className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
              {errors.lastName && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.email}</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              {...register('email', { required: t.emailReq })} 
              className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
            />
            {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.password}</label>
            <input 
              type="password" 
              placeholder={t.passPlaceholder}
              {...register('password', { 
                required: t.passReq, 
                minLength: { value: 6, message: t.passMin } 
              })} 
              className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
            />
            {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer"
          >
            {t.createBtn}
          </button>
        </form>

        <div className="mt-6 text-center pt-5 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            {t.hasAccount}{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {t.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;