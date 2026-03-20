import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getProfile } from '../../services/userService';
import Loader from '../../components/common/Loader';

const Profile = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getProfile,
  });

  if (isLoading) return <Loader />;

  // Unwrap if nested under data
  const userData = user?.data || user;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h1>
        <p className="text-gray-500 mt-2">Personalize your dietary and calorie intake settings.</p>
      </header>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black mb-6 border-4 border-white shadow-md">
          {userData?.firstName?.charAt(0) || 'U'}
        </div>
        
        <h2 className="text-2xl font-black text-gray-900">{userData?.firstName} {userData?.lastName}</h2>
        <p className="text-gray-500 font-medium mb-8">{userData?.email}</p>

        <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 pt-8">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-green-600 font-bold">Active</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account</p>
            <p className="text-gray-700 font-bold">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
