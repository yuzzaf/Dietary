import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile, updateProfilePicture } from '../../services/userService';
import { getGoal, upsertGoal } from '../../services/goalService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

const Profile = () => {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const root = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const t = {
    title: lang === 'id' ? 'Profil Pengguna' : 'User Profile',
    desc: lang === 'id' ? 'Kelola metrik tubuh, data akun, dan target nutrisi Anda.' : 'Manage your body metrics, account data, and nutrition targets.',
    editBtn: lang === 'id' ? 'Edit Profil' : 'Edit Profile',
    account: lang === 'id' ? 'Akun' : 'Account',
    tier: lang === 'id' ? 'Tingkat' : 'Tier',
    active: lang === 'id' ? 'Aktif' : 'Active',
    metricsTitle: lang === 'id' ? 'Metrik Fisik & Target' : 'Physical Metrics & Targets',
    editingMode: lang === 'id' ? 'Mode mengedit' : 'Editing mode',
    weight: lang === 'id' ? 'Berat Badan' : 'Weight',
    height: lang === 'id' ? 'Tinggi Badan' : 'Height',
    age: lang === 'id' ? 'Usia' : 'Age',
    gender: lang === 'id' ? 'Jenis Kelamin' : 'Gender',
    activityLevel: lang === 'id' ? 'Tingkat Aktivitas' : 'Activity Level',
    nutritionGoals: lang === 'id' ? 'Target Nutrisi' : 'Nutrition Goals',
    goalStrategy: lang === 'id' ? 'Strategi Target' : 'Goal Strategy',
    targetCalories: lang === 'id' ? 'Target Kalori Harian' : 'Target Daily Calories',
    notConfigured: lang === 'id' ? 'Belum dikonfigurasi' : 'Not configured',
    selectGender: lang === 'id' ? 'Pilih Jenis Kelamin' : 'Select Gender',
    male: lang === 'id' ? 'Laki-laki' : 'Male',
    female: lang === 'id' ? 'Perempuan' : 'Female',
    sedentary: lang === 'id' ? 'Kurang Bergerak (Jarang olahraga)' : 'Sedentary (Little or no exercise)',
    light: lang === 'id' ? 'Ringan (1-3 hari per minggu)' : 'Lightly Active (1-3 days per week)',
    activeOpt: lang === 'id' ? 'Aktif (Olahraga harian / fisik)' : 'Active (Daily exercise or active job)',
    loseWeight: lang === 'id' ? 'Turunkan Berat Badan (Defisit Kalori)' : 'Lose Weight (Calorie Deficit)',
    maintain: lang === 'id' ? 'Pertahankan Berat Badan' : 'Maintain Current Weight',
    gainWeight: lang === 'id' ? 'Tambah Berat Badan (Surplus Kalori)' : 'Gain Weight (Calorie Surplus)',
    cancel: lang === 'id' ? 'Batal' : 'Cancel',
    saveChanges: lang === 'id' ? 'Simpan Perubahan' : 'Save Changes',
    saving: lang === 'id' ? 'Menyimpan...' : 'Saving...',
    photoUpdated: lang === 'id' ? 'Foto profil diperbarui!' : 'Profile photo updated!',
    profileUpdated: lang === 'id' ? 'Profil berhasil diperbarui!' : 'Profile updated successfully!',
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getProfile,
  });

  const userData = user?.data || user;

  const { data: goalDataRes, isLoading: goalLoading } = useQuery({
    queryKey: ['user-goal'],
    queryFn: getGoal,
  });

  const userGoal = goalDataRes?.data || null;

  const photoMutation = useMutation({
    mutationFn: (formData) => updateProfilePicture(formData),
    onSuccess: () => {
      toast.success(t.photoUpdated);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      photoMutation.mutate(formData);
    }
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      weight: userData?.weight || '',
      height: userData?.height || '',
      age: userData?.age || '',
      gender: userData?.gender || '',
      activityLevel: userData?.activityLevel || 'moderate',
      goalType: userGoal?.goalType || 'maintain',
      targetCalories: userGoal?.targetCalories || '',
    }
  });

  useEffect(() => {
    if (userData || userGoal) {
      reset({
        weight: userData?.weight || '',
        height: userData?.height || '',
        age: userData?.age || '',
        gender: userData?.gender || '',
        activityLevel: userData?.activityLevel || 'moderate',
        goalType: userGoal?.goalType || 'maintain',
        targetCalories: userGoal?.targetCalories || '',
      });
    }
  }, [userData, userGoal, reset]);

  useEffect(() => {
    if (!isLoading && !goalLoading && root.current) {
      const container = root.current.querySelector('.profile-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
        );
      }
    }
  }, [isLoading, goalLoading]);

  const updateMutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: () => {
      toast.success(t.profileUpdated);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  });

  const goalMutation = useMutation({
    mutationFn: (data) => upsertGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goal'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Goal update failed');
    }
  });

  if (isLoading || goalLoading) return <Loader />;

  const onSubmit = (data) => {
    updateMutation.mutate({
      weight: data.weight,
      height: data.height,
      age: data.age,
      gender: data.gender,
      activityLevel: data.activityLevel
    });
    
    if (data.goalType && data.targetCalories) {
      goalMutation.mutate({
        goalType: data.goalType,
        targetCalories: data.targetCalories
      });
    }
  };

  return (
    <div ref={root} className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="profile-container opacity-0 space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t.title}</h1>
            <p className="text-xs text-zinc-500">{t.desc}</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {t.editBtn}
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden border-2 border-white">
                  {userData?.profilePicture ? (
                    <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userData?.firstName?.charAt(0) || 'U'}</span>
                  )}
                  
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" disabled={photoMutation.isPending} />
                  </label>
                </div>
                {photoMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <h2 className="text-base font-bold text-zinc-900 leading-tight">
                {userData?.firstName} {userData?.lastName}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 mb-5">{userData?.email}</p>
              
              <div className="w-full pt-4 border-t border-zinc-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.account}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-100">
                    {t.active}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t.tier}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-100">
                    Pro Free
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <h3 className="text-sm font-bold text-zinc-900">{t.metricsTitle}</h3>
                {isEditing && (
                  <span className="text-[11px] font-medium text-blue-600">{t.editingMode}</span>
                )}
              </div>
              
              <div className="p-6">
                {!isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard label={t.weight} value={userData?.weight} unit="kg" notConfiguredText={t.notConfigured} />
                    <MetricCard label={t.height} value={userData?.height} unit="cm" notConfiguredText={t.notConfigured} />
                    <MetricCard label={t.age} value={userData?.age} unit={lang === 'id' ? 'tahun' : 'years'} notConfiguredText={t.notConfigured} />
                    <MetricCard label={t.gender} value={userData?.gender} capitalize notConfiguredText={t.notConfigured} />
                    <div className="col-span-2">
                      <MetricCard label={t.activityLevel} value={userData?.activityLevel} capitalize full notConfiguredText={t.notConfigured} />
                    </div>

                    <div className="col-span-2 border-t border-zinc-100 pt-5 mt-2">
                      <h4 className="text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">{t.nutritionGoals}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard label={t.goalStrategy} value={userGoal?.goalType?.replace('_', ' ')} capitalize notConfiguredText={t.notConfigured} />
                        <MetricCard label={t.targetCalories} value={userGoal?.targetCalories} unit="kcal" notConfiguredText={t.notConfigured} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput 
                        label={`${t.weight} (kg)`}
                        type="number" 
                        step="0.1"
                        register={register('weight', { required: 'Weight is required' })}
                        error={errors.weight}
                      />
                      <FormInput 
                        label={`${t.height} (cm)`} 
                        type="number" 
                        register={register('height', { required: 'Height is required' })}
                        error={errors.height}
                      />
                      <FormInput 
                        label={t.age} 
                        type="number" 
                        register={register('age', { required: 'Age is required' })}
                        error={errors.age}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.gender}</label>
                        <select 
                          {...register('gender', { required: 'Gender is required' })}
                          className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                        >
                          <option value="">{t.selectGender}</option>
                          <option value="male">{t.male}</option>
                          <option value="female">{t.female}</option>
                        </select>
                        {errors.gender && <p className="text-rose-500 text-xs mt-1">{errors.gender.message}</p>}
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.activityLevel}</label>
                        <select 
                          {...register('activityLevel')}
                          className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                        >
                          <option value="sedentary">{t.sedentary}</option>
                          <option value="light">{t.light}</option>
                          <option value="active">{t.activeOpt}</option>
                        </select>
                      </div>

                      <div className="col-span-1 md:col-span-2 pt-4 border-t border-zinc-100">
                        <h4 className="text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">{t.nutritionGoals}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{t.goalStrategy}</label>
                            <select 
                              {...register('goalType')}
                              className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                            >
                              <option value="lose_weight">{t.loseWeight}</option>
                              <option value="maintain">{t.maintain}</option>
                              <option value="gain_weight">{t.gainWeight}</option>
                            </select>
                          </div>

                          <FormInput 
                            label={`${t.targetCalories} (kcal)`} 
                            type="number" 
                            register={register('targetCalories')}
                            error={errors.targetCalories}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-2.5 px-4 border border-zinc-200 text-zinc-700 font-semibold text-xs rounded-xl hover:bg-zinc-50 transition active:scale-95 cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        type="submit" 
                        disabled={updateMutation.isPending}
                        className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-sm disabled:opacity-60 cursor-pointer"
                      >
                        {updateMutation.isPending ? t.saving : t.saveChanges}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, capitalize, full, notConfiguredText }) => (
  <div className={`p-4 bg-zinc-50/60 rounded-xl border border-zinc-100 ${full ? 'w-full' : ''}`}>
    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-bold text-zinc-900 tabular-nums ${capitalize ? 'capitalize' : ''}`}>
      {value ? `${value}${unit ? ' ' + unit : ''}` : <span className="text-zinc-400 italic text-xs font-normal">{notConfiguredText || 'Not configured'}</span>}
    </p>
  </div>
);

const FormInput = ({ label, type, register, error, step }) => (
  <div>
    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">{label}</label>
    <input 
      type={type}
      step={step}
      {...register}
      className={`w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-4 ${
        error ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-500/10' : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/10'
      }`}
    />
    {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error.message}</p>}
  </div>
);

export default Profile;