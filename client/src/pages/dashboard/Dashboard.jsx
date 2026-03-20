import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import { getLogsToday } from '../../services/logService';
import { getInsight } from '../../services/insightService';
import { getGoal } from '../../services/goalService';
import { formatCalories } from '../../utils/formatCalories';
import Loader from '../../components/common/Loader';
import TypewriterText from '../../components/common/TypewriterText';

const Dashboard = () => {
  const root = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data: todayData, isLoading: logsLoading } = useQuery({
    queryKey: ['logs-today'],
    queryFn: getLogsToday,
    enabled: isAuthenticated,
  });

  const { data: insightData, isLoading: insightLoading } = useQuery({
    queryKey: ['ai-insight'],
    queryFn: getInsight,
    enabled: isAuthenticated,
  });

  const { data: goalDataRes, isLoading: goalLoading } = useQuery({
    queryKey: ['user-goal'],
    queryFn: getGoal,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && !logsLoading && !insightLoading && root.current) {
      const statCards = root.current.querySelectorAll('.stat-card');
      statCards.forEach((el, index) => {
        el.animate(
          [
            { transform: 'translateY(20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
          ],
          {
            duration: 800,
            delay: index * 100,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fill: 'forwards'
          }
        );
      });
      
      if (todayData?.logs?.length > 0) {
        const logItems = root.current.querySelectorAll('.activity-log-item');
        logItems.forEach((el, index) => {
          el.animate(
            [
              { transform: 'translateX(-20px)', opacity: 0 },
              { transform: 'translateX(0)', opacity: 1 }
            ],
            {
              duration: 500,
              delay: index * 100,
              easing: 'ease-out',
              fill: 'forwards'
            }
          );
        });
      }
    }
  }, [isAuthenticated, logsLoading, insightLoading, todayData]);

  if (isAuthenticated && (logsLoading || insightLoading || goalLoading)) return <Loader />;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-12 animate-fade-in">
        {/* Hero Section */}
        <section className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Master Your Nutrition with <span className="text-blue-600">AI Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed min-h-[84px]">
            <TypewriterText text="The smartest way to track your daily calories. Just snap a photo or search our database. Get personalized insights driven by advanced AI." />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/login" 
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition active:scale-95"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/detect" 
              className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-800 font-bold rounded-2xl hover:border-blue-200 transition active:scale-95"
            >
              Try Food Detection
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl pt-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 text-left hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Scan</h3>
            <p className="text-gray-500">Just upload a photo of your meal and let our AI calculate your calories instantly.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 text-left hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-500">Access nutritional data for over 100,000+ commercial and natural food items.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 text-left hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Insights</h3>
            <p className="text-gray-500">Receive personalized nutritional feedback to help you hit your daily health goals.</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view for authenticated users
  const logs = todayData?.logs || [];
  const totalCalories = todayData?.totalCalories || 0;
  const insight = insightData?.insight;
  const userGoal = goalDataRes?.data;

  return (
    <div ref={root} className="space-y-6 pb-12 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daily Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stat-card opacity-0 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition">
             <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2">Today's Calories</h2>
          <p className="text-5xl font-black text-blue-600">
            {formatCalories(totalCalories)}
            {userGoal?.targetCalories && (
              <span className="text-2xl text-gray-400 font-medium tracking-normal"> / {formatCalories(userGoal.targetCalories)}</span>
            )}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            {logs.length} items logged
          </div>
        </div>

        <div className="stat-card opacity-0 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-4">AI Insight</h2>
          <div className="prose prose-sm text-gray-600 leading-relaxed italic">
            {insight ? (
              <p>{insight}</p>
            ) : (
              <p>Start logging your meals to unlock personalized AI nutrition insights!</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        {logs.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {logs.slice(0, 5).map((log) => (
              <li key={log.id} className="activity-log-item py-4 flex justify-between items-center hover:bg-gray-50 transition px-2 rounded-xl opacity-0">
                <div>
                  <p className="font-bold text-gray-800 capitalize">
                    {log.Food?.name || 'Unknown Item'}
                    <span className="text-xs text-gray-500 font-normal ml-2 lowercase">x{log.quantity || 1}</span>
                  </p>
                  <p className="text-xs text-gray-400 font-medium">{new Date(log.consumedAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="font-black text-gray-700">{formatCalories(log.Food?.calories * log.quantity || 0)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 font-medium">No activity recorded today.</p>
            <Link to="/detect" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Record your first meal</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
