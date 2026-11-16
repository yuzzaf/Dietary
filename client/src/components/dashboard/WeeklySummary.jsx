import { formatCalories } from "../../utils/formatCalories";
import { useLanguage } from "../../context/LanguageContext";

const WeeklySummary = ({
  weeklyInsights,
  weeklyMeta,
  onExportPdf,
}) => {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="stat-card opacity-0 bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            {isEn ? "Weekly AI Summary" : "Ringkasan Mingguan AI"}
          </h2>
          {weeklyInsights && weeklyInsights.length > 0 && (
            <button
              onClick={onExportPdf}
              className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export PDF
            </button>
          )}
        </div>

        {weeklyMeta && (
          <div className="text-xs text-zinc-500">
            7-Day Total:{" "}
            <span className="font-bold text-zinc-900 tabular-nums">
              {formatCalories(weeklyMeta.totalWeeklyCalories)}
            </span>
            <span className="text-zinc-400 tabular-nums">
              {" "}
              / {formatCalories(weeklyMeta.totalWeeklyTarget)}
            </span>
          </div>
        )}
      </div>

      {weeklyInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {weeklyInsights.map((day) => (
            <div
              key={day.date}
              className="p-4 rounded-xl border border-zinc-200/70 bg-zinc-50/50 flex flex-col justify-between space-y-2 hover:bg-zinc-50 transition"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-900">
                  {new Date(day.date).toLocaleDateString(isEn ? "en-US" : "id-ID", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-zinc-500 font-medium tabular-nums">
                  {formatCalories(day.calories)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed">
                {day.insight || "No specific log analysis for this day."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xs text-zinc-400">
            {isEn
              ? "Weekly trend insights will populate as you log meals over time."
              : "Tren wawasan mingguan akan muncul seiring Anda mencatat makanan."}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklySummary;
