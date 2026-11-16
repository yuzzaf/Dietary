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
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-24 animate-fade-in max-w-6xl mx-auto">
        {/* 1. Hero Section */}
        <section className="max-w-3xl space-y-6 pt-4">
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

        {/* 2. Interactive Product Mockup / App Preview */}
        <section className="w-full max-w-5xl">
          <div className="relative rounded-2xl border border-zinc-200/80 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] overflow-hidden text-left">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/70">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-[11px] font-mono text-zinc-400">dietary.app / live-food-detection</span>
              </div>
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Gemini 2.5 Vision
              </span>
            </div>

            {/* Mockup Body: Split Image + Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              {/* Left Photo Showcase */}
              <div className="md:col-span-7 relative bg-zinc-900 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                  alt="Healthy Salmon Salad Meal Bowl"
                  className="w-full h-72 sm:h-96 md:h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                
                {/* Floating Scanner Box */}
                <div className="absolute top-6 left-6 right-6 bottom-6 border-2 border-dashed border-blue-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                  <div className="self-start bg-zinc-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Target Detected: Mediterranean Bowl
                  </div>
                  <div className="self-end bg-blue-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                    99.4% Match
                  </div>
                </div>
              </div>

              {/* Right Analysis Breakdown */}
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Classified Meal</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Balanced</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">Grilled Salmon Quinoa Bowl</h3>
                  <p className="text-xs text-zinc-500 mt-1">Rich in healthy omega-3 fatty acids, complex carbs, and lean protein.</p>
                </div>

                {/* Macro Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[11px] font-medium text-zinc-400 block">Total Calories</span>
                    <span className="text-xl font-extrabold text-zinc-900 tabular-nums">540 <span className="text-xs font-normal text-zinc-500">kcal</span></span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <span className="text-[11px] font-medium text-blue-600 block">Protein</span>
                    <span className="text-xl font-extrabold text-blue-900 tabular-nums">42 <span className="text-xs font-normal text-blue-600">g</span></span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <span className="text-[11px] font-medium text-amber-600 block">Carbs</span>
                    <span className="text-xl font-extrabold text-amber-900 tabular-nums">34 <span className="text-xs font-normal text-amber-600">g</span></span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                    <span className="text-[11px] font-medium text-rose-600 block">Healthy Fats</span>
                    <span className="text-xl font-extrabold text-rose-900 tabular-nums">18 <span className="text-xs font-normal text-rose-600">g</span></span>
                  </div>
                </div>

                {/* AI Assistant Remark */}
                <div className="p-3.5 rounded-xl bg-zinc-900 text-white text-xs leading-relaxed flex items-start gap-3 shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    <strong className="text-white font-semibold">AI Coach:</strong> Excellent choice. You have reached 68% of your protein goal for today.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How It Works - 3 Step Flow */}
        <section className="w-full max-w-5xl space-y-12">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Three simple steps to nutritional clarity
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
              No more tedious manual barcode typing or vague meal guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
              <span className="text-4xl font-black text-zinc-100 absolute top-4 right-4 select-none">01</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 mb-1">Snap or Search Meal</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Take a photo of your plate or search through over 100,000 verified foods in our database.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                Zero manual math <span aria-hidden="true">→</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
              <span className="text-4xl font-black text-zinc-100 absolute top-4 right-4 select-none">02</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 mb-1">Instant AI Breakdown</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Google Gemini scans ingredients, portion weights, and retrieves clinical caloric data in under a second.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                Clinically verified <span aria-hidden="true">→</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
              <span className="text-4xl font-black text-zinc-100 absolute top-4 right-4 select-none">03</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 mb-1">Weekly Reports & Coach</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Monitor your daily deficit, chat with your nutrition coach, and download one-click PDF summaries for your doctor.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                Export to PDF <span aria-hidden="true">→</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Trust & Precision Metrics */}
        <section className="w-full max-w-5xl py-8 px-6 bg-white rounded-2xl border border-zinc-200/80 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tabular-nums">100k+</span>
              <p className="text-xs text-zinc-500 font-medium">Verified Foods</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tabular-nums">&lt; 1.2s</span>
              <p className="text-xs text-zinc-500 font-medium">Gemini Detection Time</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">100%</span>
              <p className="text-xs text-zinc-500 font-medium">Free To Use</p>
            </div>
            <div className="space-y-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tabular-nums">PDF</span>
              <p className="text-xs text-zinc-500 font-medium">Weekly Health Reports</p>
            </div>
          </div>
        </section>

        {/* 5. Bento Features Grid */}
        <section className="w-full max-w-5xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Capabilities</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">Built for serious wellness</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-sm hover:border-zinc-300 transition-all">
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

            <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-sm hover:border-zinc-300 transition-all">
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

            <div className="bg-white p-7 rounded-2xl border border-zinc-200/80 shadow-sm hover:border-zinc-300 transition-all">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1.5">Personalized AI Coach</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Receive smart daily coaching on deficits, macro balances, and tailored meal suggestions to keep your fitness on track.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Ready to Transform CTA Section */}
        <section className="w-full max-w-4xl bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-xl mx-auto space-y-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to take control of your diet?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Join thousands of users who simplified their meal logging with computer vision. No subscription fees required.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-all active:scale-[0.98]"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Trusted Attribution & Footer */}
        <footer className="pt-8 border-t border-zinc-200/60 w-full max-w-4xl flex flex-col items-center justify-center space-y-4">
          <p className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase">Verified Clinical Data Partners</p>
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
          <p className="text-[11px] text-zinc-400 pt-2">© {new Date().getFullYear()} Dietary. Precision Nutrition Intelligence.</p>
        </footer>
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
