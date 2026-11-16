import { Link } from "react-router";
import { formatCalories } from "../../utils/formatCalories";
import { useLanguage } from "../../context/LanguageContext";

const TodayMeals = ({ logs }) => {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] p-6 sm:p-7">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-zinc-900 tracking-tight">
          {isEn ? "Today's Meals" : "Makanan Hari Ini"}
        </h2>
        {logs.length > 0 && (
          <Link
            to="/logs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {isEn ? "View all history →" : "Lihat semua riwayat →"}
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
                  {(log.Food?.name || "F")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-900 capitalize">
                    {log.Food?.name || "Meal Item"}
                    <span className="text-[11px] text-zinc-400 font-normal ml-1.5">
                      &times;{log.quantity || 1}
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {new Date(
                      log.consumedAt || log.createdAt,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
          <p className="text-xs text-zinc-400 font-medium">
            {isEn ? "No meals recorded yet today." : "Belum ada makanan yang dicatat hari ini."}
          </p>
          <Link
            to="/detect"
            className="text-xs font-semibold text-blue-600 hover:underline inline-block"
          >
            {isEn ? "Scan or add your first meal →" : "Pindai atau catat makanan pertama Anda →"}
          </Link>
        </div>
      )}
    </div>
  );
};

export default TodayMeals;
