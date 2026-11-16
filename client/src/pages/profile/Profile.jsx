import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile, updateProfilePicture } from '../../services/userService';
import { getGoal, upsertGoal } from '../../services/goalService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const queryClient = useQueryClient();
  const root = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

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
      toast.success('Profile photo updated!');
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
      toast.success('Profile updated successfully!');
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
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Profile</h1>
            <p className="text-xs text-zinc-500">Manage your body metrics, account data, and nutrition targets.</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Bio Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden border-2 border-white">
                  {userData?.profilePicture ? (
                    <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userData?.firstName?.charAt(0) || 'U'}</span>
                  )}
                  
                  {/* Photo upload overlay */}
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
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Account</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-100">
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tier</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md border border-blue-100">
                    Pro Free
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Metrics Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <h3 className="text-sm font-bold text-zinc-900">Physical Metrics & Targets</h3>
                {isEditing && (
                  <span className="text-[11px] font-medium text-blue-600">Editing mode</span>
                )}
              </div>
              
              <div className="p-6">
                {!isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard label="Weight" value={userData?.weight} unit="kg" />
                    <MetricCard label="Height" value={userData?.height} unit="cm" />
                    <MetricCard label="Age" value={userData?.age} unit="years" />
                    <MetricCard label="Gender" value={userData?.gender} capitalize />
                    <div className="col-span-2">
                      <MetricCard label="Activity Level" value={userData?.activityLevel} capitalize full />
                    </div>

                    <div className="col-span-2 border-t border-zinc-100 pt-5 mt-2">
                      <h4 className="text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">Nutrition Goals</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <MetricCard label="Goal Strategy" value={userGoal?.goalType?.replace('_', ' ')} capitalize />
                        <MetricCard label="Target Daily Calories" value={userGoal?.targetCalories} unit="kcal" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput 
                        label="Weight (kg)" 
                        type="number" 
                        step="0.1"
                        register={register('weight', { required: 'Weight is required' })}
                        error={errors.weight}
                      />
                      <FormInput 
                        label="Height (cm)" 
                        type="number" 
                        register={register('height', { required: 'Height is required' })}
                        error={errors.height}
                      />
                      <FormInput 
                        label="Age" 
                        type="number" 
                        register={register('age', { required: 'Age is required' })}
                        error={errors.age}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Gender</label>
                        <select 
                          {...register('gender', { required: 'Gender is required' })}
                          className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {errors.gender && <p className="text-rose-500 text-xs mt-1">{errors.gender.message}</p>}
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Activity Level</label>
                        <select 
                          {...register('activityLevel')}
                          className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                        >
                          <option value="sedentary">Sedentary (Little or no exercise)</option>
                          <option value="light">Lightly Active (1-3 days per week)</option>
                          <option value="active">Active (Daily exercise or active job)</option>
                        </select>
                      </div>

                      <div className="col-span-1 md:col-span-2 pt-4 border-t border-zinc-100">
                        <h4 className="text-[11px] font-bold text-zinc-400 mb-3 uppercase tracking-wider">Nutrition Goals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Goal Type</label>
                            <select 
                              {...register('goalType')}
                              className="w-full px-3.5 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 cursor-pointer"
                            >
                              <option value="lose_weight">Lose Weight (Calorie Deficit)</option>
                              <option value="maintain">Maintain Current Weight</option>
                              <option value="gain_weight">Gain Weight (Calorie Surplus)</option>
                            </select>
                          </div>

                          <FormInput 
                            label="Target Calories (kcal)" 
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
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={updateMutation.isPending}
                        className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-sm disabled:opacity-60 cursor-pointer"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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

const MetricCard = ({ label, value, unit, capitalize, full }) => (
  <div className={`p-4 bg-zinc-50/60 rounded-xl border border-zinc-100 ${full ? 'w-full' : ''}`}>
    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-bold text-zinc-900 tabular-nums ${capitalize ? 'capitalize' : ''}`}>
      {value ? `${value}${unit ? ' ' + unit : ''}` : <span className="text-zinc-400 italic text-xs font-normal">Not configured</span>}
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
