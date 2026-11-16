import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Link } from 'react-router';
import { fetchLogsToday } from '../../store/slices/logSlice';
import { fetchInsight, fetchWeeklyInsight } from '../../store/slices/insightSlice';
import { fetchUserGoal } from '../../store/slices/userSlice';
import { exportWeeklyInsightPdf } from '../../services/insightService';
import { formatCalories } from '../../utils/formatCalories';
import Loader from '../../components/common/Loader';
import TypewriterText from '../../components/common/TypewriterText';

const Dashboard = () => {
  const root = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { todayData, loading: logsLoading } = useSelector((state) => state.log);
  const { dailyInsight: insightData, weeklyInsights: weeklyData, weeklyMeta, loading: insightLoading, weeklyLoading } = useSelector((state) => state.insight);
  const { userGoal, goalLoading } = useSelector((state) => state.user);

  const handleExportPdf = async () => {
    const toastId = toast.loading("Generating PDF Report...");
    try {
      const blob = await exportWeeklyInsightPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dietary_Weekly_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF Downloaded successfully!", { id: toastId });
    } catch {
      toast.error("Failed to generate PDF.", { id: toastId });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchLogsToday());
      dispatch(fetchInsight());
      dispatch(fetchWeeklyInsight());
      dispatch(fetchUserGoal());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !logsLoading && !insightLoading && !weeklyLoading && root.current) {
      const statCards = root.current.querySelectorAll('.stat-card');
      statCards.forEach((el, index) => {
        el.animate(
          [
            { transform: 'translateY(16px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
          ],
          {
            duration: 400,
            delay: index * 80,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards'
          }
        );
      });
      
      if (todayData?.logs?.length > 0) {
        const logItems = root.current.querySelectorAll('.activity-log-item');
        logItems.forEach((el, index) => {
          el.animate(
            [
              { transform: 'translateX(-12px)', opacity: 0 },
              { transform: 'translateX(0)', opacity: 1 }
            ],
            {
              duration: 350,
              delay: index * 60,
              easing: 'ease-out',
              fill: 'forwards'
            }
          );
        });
      }
    }
  }, [isAuthenticated, logsLoading, insightLoading, weeklyLoading, goalLoading, todayData]);

  if (isAuthenticated && (logsLoading || insightLoading || goalLoading || weeklyLoading)) return <Loader />;

  // Landing view for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-16 animate-fade-in">
        {/* Hero Section */}
        <section className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            AI-Powered Nutrition Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
            Precision nutrition. <br />
            <span className="text-blue-600">Effortless tracking.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto min-h-[64px]">
            <TypewriterText text="Track calories, log meals with computer vision, and unlock personalized nutritional coaching driven by advanced AI models." />
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Get Started for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link 
              to="/detect" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-800 font-semibold text-sm rounded-xl hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
              Try Food Detection
            </Link>
          </div>
        </section>

        {/* Bento Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl text-left">
          <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Instant Vision Scanner</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Snap a photo of your food plate. Google Gemini computer vision classifies and calculates caloric estimates instantly.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Verified Nutrition Library</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Access comprehensive, verified macronutrient data for over 100,000+ natural and commercial foods via FatSecret & Edamam.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">Personalized AI Coach</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Receive smart daily coaching on deficits, macro balances, and tailored meal suggestions to keep your fitness on track.
            </p>
          </div>
        </div>

        {/* Trusted Attribution */}
        <div className="pt-8 border-t border-zinc-200/60 w-full max-w-4xl flex flex-col items-center justify-center space-y-4">
          <p className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase">Verified Data Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-75 hover:opacity-100 transition-opacity duration-200">
            <a href="https://platform.fatsecret.com" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
              <img 
                alt="FatSecret API" 
                src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret_horizontal_brand.svg" 
                className="h-6"
              />
            </a>
            <a href="https://www.edamam.com" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
              <img 
                alt="Edamam" 
                src="https://developer.edamam.com/images/transparent.png" 
                className="h-7" 
              />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view for authenticated users
  const logs = todayData?.logs || [];
  const totalCalories = todayData?.totalCalories || 0;
  const targetCalories = userGoal?.targetCalories || 2000;
  const caloriePercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));
  const insight = insightData?.insight;
  const weeklyInsights = weeklyData || [];

  return (
    <div ref={root} className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Today's Overview</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/detect"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Log Meal
          </Link>
        </div>
      </header>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Calorie Card */}
        <div className="stat-card opacity-0 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Calorie Target</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {caloriePercent}% completed
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
                {formatCalories(totalCalories)}
              </span>
              <span className="text-sm font-medium text-zinc-400 tabular-nums">
                / {formatCalories(targetCalories)} kcal
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-100 h-2 rounded-full mt-5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>{logs.length} meal{logs.length !== 1 ? 's' : ''} logged today</span>
            <Link to="/logs" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View details &rarr;
            </Link>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="stat-card opacity-0 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Gemini Nutrition Coach</span>
            </div>

            <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/70 p-4 rounded-xl border border-zinc-100">
              {insight ? (
                <p className="italic">{insight}</p>
              ) : (
                <p className="text-zinc-400">Log meals throughout the day to receive intelligent calorie guidance and coaching.</p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
            Personalized advice based on your metabolic goals
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-7">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">Today's Meals</h2>
          {logs.length > 0 && (
            <Link to="/logs" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all history
            </Link>
          )}
        </div>

        {logs.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {logs.slice(0, 5).map((log) => (
              <div 
                key={log.id} 
                className="activity-log-item py-3.5 flex justify-between items-center hover:bg-zinc-50/60 px-2 rounded-xl transition duration-150 opacity-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs">
                    {(log.Food?.name || 'F')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 capitalize">
                      {log.Food?.name || 'Meal Item'}
                      <span className="text-[11px] text-zinc-400 font-normal ml-1.5">&times;{log.quantity || 1}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {new Date(log.consumedAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <span className="text-xs font-bold text-zinc-900 tabular-nums">
                  {formatCalories(log.Food?.calories * log.quantity || 0)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs text-zinc-400 font-medium">No meals recorded yet today.</p>
            <Link to="/detect" className="text-xs font-semibold text-blue-600 hover:underline inline-block">
              Scan or add your first meal &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Weekly Insights Card */}
      <div className="stat-card opacity-0 bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Weekly AI Summary</h2>
            {weeklyData && weeklyData.length > 0 && (
              <button 
                onClick={handleExportPdf}
                className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
              </button>
            )}
          </div>

          {weeklyMeta && (
            <div className="text-xs text-zinc-500">
              7-Day Total: <span className="font-bold text-zinc-900 tabular-nums">{formatCalories(weeklyMeta.totalWeeklyCalories)}</span>
              <span className="text-zinc-400 tabular-nums"> / {formatCalories(weeklyMeta.totalWeeklyTarget)}</span>
            </div>
          )}
        </div>
        
        {weeklyInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {weeklyInsights.map((wk) => (
              <div 
                key={wk.id} 
                className="p-4 border border-zinc-200/70 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition rounded-xl flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <span className="text-xs font-semibold text-zinc-800">
                    {new Date(wk.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${
                    wk.status === 'balanced' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    wk.status === 'deficit' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                    'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {wk.status || 'unknown'}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed italic">{wk.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-zinc-400">Keep logging your meals across the week to unlock automated nutritional reports.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
