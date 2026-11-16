import { useLanguage } from "../../context/LanguageContext";

const MacroAndWater = ({
  totalProtein,
  totalCarbs,
  totalFat,
  waterGlasses,
  onWaterChange,
}) => {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Macros Breakdown (8 cols) */}
      <div className="stat-card opacity-0 md:col-span-8 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
            {isEn ? "Today's Macronutrients" : "Makronutrisi Hari Ini"}
          </h2>
          <span className="text-[11px] font-medium text-zinc-400">
            {isEn ? "Auto-calculated from meals" : "Dihitung otomatis dari makanan"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          {/* Protein */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Protein
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-blue-950 tabular-nums">
                {totalProtein}
              </span>
              <span className="text-xs font-semibold text-blue-600">g</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {isEn ? "Lean mass recovery" : "Pemulihan massa otot"}
            </p>
          </div>

          {/* Carbohydrates */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
                Carbs
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-950 tabular-nums">
                {totalCarbs}
              </span>
              <span className="text-xs font-semibold text-amber-600">g</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {isEn ? "Energy & glycogen" : "Energi & glikogen"}
            </p>
          </div>

          {/* Fat */}
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
                Fats
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-rose-950 tabular-nums">
                {totalFat}
              </span>
              <span className="text-xs font-semibold text-rose-600">g</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              {isEn ? "Hormonal balance" : "Keseimbangan hormon"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Water / Hydration Tracker (4 cols) */}
      <div className="stat-card opacity-0 md:col-span-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💧</span>
              <h3 className="text-sm font-bold text-zinc-900">
                {isEn ? "Hydration" : "Hidrasi"}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-blue-600 tabular-nums bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {waterGlasses} / 8 {isEn ? "Glasses" : "Gelas"}
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-3">
            {isEn ? "Daily goal: 2,000 ml" : "Target harian 2.000 ml"}
          </p>

          {/* Glasses Visual Bar */}
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`h-6 rounded-md transition-all duration-300 ${
                  i < waterGlasses
                    ? "bg-blue-500 shadow-sm shadow-blue-500/20"
                    : "bg-zinc-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-xs text-zinc-500 font-medium">
            ~{waterGlasses * 250} ml
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onWaterChange(-1)}
              disabled={waterGlasses <= 0}
              className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => onWaterChange(1)}
              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center transition shadow-sm cursor-pointer active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacroAndWater;
