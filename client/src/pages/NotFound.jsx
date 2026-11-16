import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Micro Topbar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            Dietary
          </span>
        </Link>

        <span className="text-xs font-semibold text-zinc-400 font-mono">
          HTTP 404: RESOURCE_MISSING
        </span>
      </header>

      {/* Main Hero Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-zinc-200/80 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] text-center space-y-7 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {isEn ? "Nutritional Deficit Detected" : "Piring Kosong (0 Kalori)"}
          </div>

          {/* Food Scanner 404 Visual Mockup */}
          <div className="relative mx-auto w-36 h-36 rounded-full bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center p-3 shadow-inner group">
            {/* Empty Plate Graphic */}
            <div className="w-24 h-24 rounded-full border-4 border-zinc-200/80 flex items-center justify-center bg-white shadow-sm">
              <span className="text-3xl select-none group-hover:scale-110 transition-transform duration-300">
                🍽️
              </span>
            </div>

            {/* AI Vision Scan Reticle Overlay */}
            <div className="absolute inset-2 border border-blue-400/40 rounded-full animate-spin [animation-duration:12s] pointer-events-none" />
            
            {/* 404 Stamp */}
            <span className="absolute -bottom-2 bg-zinc-900 text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              0 kcal
            </span>
          </div>

          {/* Headings */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {isEn
                ? "Looks like this plate is empty."
                : "Sepertinya piring ini kosong."}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
              {isEn
                ? "We scanned our entire database of 100,000+ foods and routes, but couldn't find the recipe or page you're craving."
                : "Kami telah memindai seluruh basis data makanan kami, tetapi halaman atau resep yang Anda tuju tidak ditemukan."}
            </p>
          </div>

          {/* Humorous Macro Breakdown Box */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-left">
            <div className="p-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Calories
              </span>
              <span className="text-sm font-bold text-zinc-800">0 kcal</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Found
              </span>
              <span className="text-sm font-bold text-rose-600">404 Err</span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Recovery
              </span>
              <span className="text-sm font-bold text-blue-600">Instant</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-1">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {isEn ? "Back to Dashboard" : "Kembali ke Beranda"}
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {isEn ? "Previous Page" : "Halaman Sebelumnya"}
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-4 text-xs text-zinc-400">
            <Link
              to="/detect"
              className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
            >
              📸 {isEn ? "Scan Meal" : "Pindai Makanan"}
            </Link>
            <span>•</span>
            <Link
              to="/search"
              className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
            >
              🔍 {isEn ? "Search Library" : "Cari Makanan"}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-zinc-400 relative z-10">
        &copy; {new Date().getFullYear()} Dietary. Precision AI Nutrition & Health.
      </footer>
    </div>
  );
};

export default NotFound;
