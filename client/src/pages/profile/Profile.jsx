import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile, updateProfilePicture } from '../../services/userService';
import { getGoal, upsertGoal } from '../../services/goalService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { animate, stagger, createScope } from 'animejs';

const Profile = () => {
  const queryClient = useQueryClient();
  const root = useRef(null);
  const scope = useRef(null);
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
      toast.success('Profile picture updated!');
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

  // Sync form with data when it loads
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
    if (!isLoading && !goalLoading) {
      scope.current = createScope({ root: root.current }).add(() => {
        animate('.profile-container', {
          translateY: [20, 0],
          opacity: [0, 1],
          easing: 'easeOutElastic(1, .8)',
          duration: 800
        });

        animate('.profile-card', {
          translateY: [20, 0],
          opacity: [0, 1],
          delay: stagger(150, {start: 200}),
          easing: 'easeOutQuad',
          duration: 500
        });
      });
      return () => scope.current.revert();
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
    <div ref={root}>
      <div className="profile-container opacity-0 max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal metrics and account settings.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition active:scale-95 shadow-sm"
          >
            Edit Profile
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simple Info Card */}
        <div className="profile-card opacity-0 lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-6 border-4 border-white shadow-xl overflow-hidden">
                {userData?.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{userData?.firstName?.charAt(0) || 'U'}</span>
                )}
                
                {/* Overlay on hover */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer mb-6 rounded-full">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" disabled={photoMutation.isPending} />
                </label>
              </div>
              {photoMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center mb-6">
                  <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {userData?.firstName} {userData?.lastName}
            </h2>
            <p className="text-gray-500 font-medium mb-6">{userData?.email}</p>
            
            <div className="w-full pt-6 border-t border-gray-100 flex justify-around">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <div className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-bold rounded-full">Active</div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Free</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="profile-card opacity-0 lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Physical Metrics</h3>
            </div>
            
            <div className="p-8">
              {!isEditing ? (
                <div className="grid grid-cols-2 gap-8">
                  <MetricView label="Weight" value={userData?.weight} unit="kg" icon="⚖️" />
                  <MetricView label="Height" value={userData?.height} unit="cm" icon="📏" />
                  <MetricView label="Age" value={userData?.age} unit="years" icon="🎂" />
                  <MetricView label="Gender" value={userData?.gender} icon="🚻" />
                  <div className="col-span-2">
                    <MetricView label="Activity Level" value={userData?.activityLevel} icon="⚡" full />
                  </div>
                  <div className="col-span-2 border-t border-gray-100 pt-6 mt-2">
                    <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Nutrition Goals</h4>
                    <div className="grid grid-cols-2 gap-8">
                      <MetricView label="Goal Type" value={userGoal?.goalType?.replace('_', ' ')} icon="🎯" />
                      <MetricView label="Target Calories" value={userGoal?.targetCalories} unit="kcal" icon="🔥" />
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Gender</label>
                      <select 
                        {...register('gender', { required: 'Gender is required' })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-xs mt-1 ml-1">{errors.gender.message}</p>}
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Activity Level</label>
                      <select 
                        {...register('activityLevel')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                      >
                        <option value="sedentary">Sedentary (Little/no exercise)</option>
                        <option value="light">Lightly Active (1-3 days/week)</option>
                        <option value="active">Active (Daily exercise/Physical job)</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Nutrition Goals</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Goal Type</label>
                        <select 
                          {...register('goalType')}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                        >
                          <option value="lose_weight">Lose Weight</option>
                          <option value="maintain">Maintain</option>
                          <option value="gain_weight">Gain Weight</option>
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

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 px-6 border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex-2 py-3 px-10 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100 disabled:bg-blue-300"
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

const MetricView = ({ label, value, unit, icon, full }) => (
  <div className={`p-4 bg-gray-50 rounded-2xl border border-gray-100 ${full ? 'w-full' : ''}`}>
    <div className="flex items-center gap-3 mb-1">
      <span className="text-lg">{icon}</span>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-xl font-black text-gray-800 ml-7">
      {value ? `${value}${unit ? ' ' + unit : ''}` : <span className="text-gray-300 italic text-sm font-medium">Not set</span>}
    </p>
  </div>
);

const FormInput = ({ label, type, register, error, step }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
    <input 
      type={type}
      step={step}
      {...register}
      className={`w-full px-4 py-3 rounded-xl border transition outline-none ${
        error ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error.message}</p>}
  </div>
);

export default Profile;
