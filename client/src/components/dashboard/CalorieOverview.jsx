import { Link } from "react-router";
import { formatCalories } from "../../utils/formatCalories";
import { useLanguage } from "../../context/LanguageContext";

const CalorieOverview = ({
  totalCalories,
  targetCalories,
  caloriePercent,
  remainingCalories,
  isOverTarget,
  logsCount,
  insight,
}) => {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Calorie Target Card */}
      <div className="stat-card opacity-0 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {isEn ? "Calorie Target" : "Target Kalori"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                isOverTarget
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-blue-50 text-blue-700 border-blue-100"
              }`}
            >
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

          {/* Dynamic Status Pill */}
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
            {isOverTarget ? (
              <span className="text-rose-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                {isEn
                  ? `${Math.abs(remainingCalories).toLocaleString()} kcal over daily target`
                  : `Kelebihan ${Math.abs(remainingCalories).toLocaleString()} kcal hari ini`}
              </span>
            ) : remainingCalories === 0 ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {isEn
                  ? "Daily calorie goal reached perfectly!"
                  : "Target kalori harian tercapai tepat!"}
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {isEn
                  ? `${remainingCalories.toLocaleString()} kcal remaining today`
                  : `Sisa ${remainingCalories.toLocaleString()} kcal menuju target`}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 h-2.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isOverTarget ? "bg-rose-500" : "bg-blue-600"
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {logsCount} {isEn ? `meal${logsCount !== 1 ? "s" : ""} logged today` : "makanan dicatat hari ini"}
          </span>
          <Link
            to="/logs"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isEn ? "View details →" : "Lihat rincian →"}
          </Link>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="stat-card opacity-0 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Gemini Nutrition Coach
            </span>
          </div>

          <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/70 p-4 rounded-xl border border-zinc-100 min-h-[96px] flex items-center">
            {insight ? (
              <p className="italic">{insight}</p>
            ) : (
              <p className="text-zinc-400">
                {isEn
                  ? "Log meals throughout the day to receive intelligent calorie guidance and coaching tailored to your metabolic goal."
                  : "Catat makanan Anda sepanjang hari untuk mendapatkan panduan kalori cerdas dari asisten AI."}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-100 text-xs text-zinc-400 flex items-center justify-between">
          <span>{isEn ? "Metabolic coaching based on your goals" : "Panduan metabolik berdasarkan target Anda"}</span>
          <Link to="/detect" className="font-semibold text-blue-600 hover:text-blue-700">
            {isEn ? "Scan more →" : "Pindai lagi →"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CalorieOverview;
