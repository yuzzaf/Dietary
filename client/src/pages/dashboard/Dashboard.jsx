import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { fetchLogsToday } from "../../store/slices/logSlice";
import {
  fetchInsight,
  fetchWeeklyInsight,
} from "../../store/slices/insightSlice";
import { fetchUserGoal } from "../../store/slices/userSlice";
import { exportWeeklyInsightPdf } from "../../services/insightService";
import { useLanguage } from "../../context/LanguageContext";
import Loader from "../../components/common/Loader";

// Modular Dashboard Sub-components
import CalorieOverview from "../../components/dashboard/CalorieOverview";
import MacroAndWater from "../../components/dashboard/MacroAndWater";
import TodayMeals from "../../components/dashboard/TodayMeals";
import WeeklySummary from "../../components/dashboard/WeeklySummary";

// Lazy-load Landing Page for unauthenticated visitors (improves bundle & load speed)
const LandingView = lazy(() => import("../../components/dashboard/LandingView"));

const Dashboard = () => {
  const root = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const { todayData, loading: logsLoading } = useSelector((state) => state.log);
  const {
    dailyInsight: insightData,
    weeklyInsights: weeklyData,
    weeklyMeta,
    loading: insightLoading,
    weeklyLoading,
  } = useSelector((state) => state.insight);
  const { userGoal, goalLoading } = useSelector((state) => state.user);

  // Water Hydration State
  const todayDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const waterKey = `dietary_water_${todayDateStr}`;

  const [waterGlasses, setWaterGlasses] = useState(() => {
    try {
      const saved = localStorage.getItem(waterKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const handleWaterChange = (delta) => {
    setWaterGlasses((prev) => {
      const next = Math.max(0, Math.min(16, prev + delta));
      try {
        localStorage.setItem(waterKey, next.toString());
      } catch {
        // ignore storage errors
      }
      if (next === 8 && prev < 8) {
        toast.success(
          isEn
            ? "💧 Great job! You've reached your 8-glass daily hydration goal!"
            : "💧 Selamat! Anda telah mencapai target 8 gelas air hari ini!",
          { icon: "🎉" },
        );
      }
      return next;
    });
  };

  const handleExportPdf = async () => {
    const toastId = toast.loading(
      isEn ? "Generating PDF Report..." : "Membuat Laporan PDF...",
    );
    try {
      const blob = await exportWeeklyInsightPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Dietary_Weekly_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(
        isEn ? "PDF Downloaded successfully!" : "Laporan PDF berhasil diunduh!",
        { id: toastId },
      );
    } catch {
      toast.error(
        isEn ? "Failed to generate PDF." : "Gagal membuat PDF.",
        { id: toastId },
      );
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
    if (
      isAuthenticated &&
      !logsLoading &&
      !insightLoading &&
      !weeklyLoading &&
      root.current
    ) {
      const statCards = root.current.querySelectorAll(".stat-card");
      statCards.forEach((el, index) => {
        el.animate(
          [
            { transform: "translateY(16px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 400,
            delay: index * 80,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          },
        );
      });

      if (todayData?.logs?.length > 0) {
        const logItems = root.current.querySelectorAll(".activity-log-item");
        logItems.forEach((el, index) => {
          el.animate(
            [
              { transform: "translateX(-12px)", opacity: 0 },
              { transform: "translateX(0)", opacity: 1 },
            ],
            {
              duration: 350,
              delay: index * 60,
              easing: "ease-out",
              fill: "forwards",
            },
          );
        });
      }
    }
  }, [
    isAuthenticated,
    logsLoading,
    insightLoading,
    weeklyLoading,
    goalLoading,
    todayData,
  ]);

  // Loading state for authenticated members
  if (
    isAuthenticated &&
    (logsLoading || insightLoading || goalLoading || weeklyLoading)
  )
    return <Loader />;

  // -------------------------------------------------------------
  // LANDING VIEW (UNAUTHENTICATED) - Lazy Loaded
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<Loader />}>
        <LandingView />
      </Suspense>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD (MEMBER VIEW)
  // -------------------------------------------------------------
  const logs = todayData?.logs || [];
  const totalCalories = todayData?.totalCalories || 0;
  const targetCalories = userGoal?.targetCalories || 2000;
  const caloriePercent = Math.min(
    100,
    Math.round((totalCalories / targetCalories) * 100),
  );
  const insight = insightData?.insight;
  const weeklyInsights = weeklyData || [];

  // Macro Totals Calculated from Today's Meals
  const totalProtein = Math.round(
    logs.reduce(
      (acc, log) =>
        acc + Number(log.Food?.protein || 0) * (log.quantity || 1),
      0,
    ),
  );
  const totalCarbs = Math.round(
    logs.reduce(
      (acc, log) =>
        acc + Number(log.Food?.carbohydrates || 0) * (log.quantity || 1),
      0,
    ),
  );
  const totalFat = Math.round(
    logs.reduce(
      (acc, log) =>
        acc + Number(log.Food?.fat || 0) * (log.quantity || 1),
      0,
    ),
  );

  const remainingCalories = targetCalories - totalCalories;
  const isOverTarget = remainingCalories < 0;

  return (
    <div ref={root} className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Header with Date and Quick Action Pills */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {isEn ? "Today's Overview" : "Ringkasan Hari Ini"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString(isEn ? "en-US" : "id-ID", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/detect"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
            {isEn ? "Scan Meal" : "Pindai Makanan"}
          </Link>

          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            <svg
              className="w-3.5 h-3.5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {isEn ? "Search Food" : "Cari Makanan"}
          </Link>

          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            <svg
              className="w-3.5 h-3.5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {isEn ? "Goal" : "Target"}
          </Link>
        </div>
      </header>

      {/* 2. Top Metric Cards (Calories & AI Coach) */}
      <CalorieOverview
        totalCalories={totalCalories}
        targetCalories={targetCalories}
        caloriePercent={caloriePercent}
        remainingCalories={remainingCalories}
        isOverTarget={isOverTarget}
        logsCount={logs.length}
        insight={insight}
      />

      {/* 3. Daily Macronutrients Breakdown & Hydration Tracker */}
      <MacroAndWater
        totalProtein={totalProtein}
        totalCarbs={totalCarbs}
        totalFat={totalFat}
        waterGlasses={waterGlasses}
        onWaterChange={handleWaterChange}
      />

      {/* 4. Recent Activity Section (Today's Meals) */}
      <TodayMeals logs={logs} />

      {/* 5. Weekly AI Summary Card */}
      <WeeklySummary
        weeklyInsights={weeklyInsights}
        weeklyMeta={weeklyMeta}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
};

export default Dashboard;
