import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import TypewriterText from "../common/TypewriterText";

const SAMPLE_MEALS = [
  {
    name: "Grilled Salmon Quinoa Bowl",
    tag: "Balanced High-Protein",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
    match: "99.4%",
    detectedName: "Mediterranean Salmon Bowl",
    calories: 540,
    protein: 42,
    carbs: 34,
    fat: 18,
    remark:
      "Optimal post-workout nutrient density. Fits comfortably within your daily goal.",
  },
  {
    name: "Grilled Chicken & Brown Rice",
    tag: "Lean Muscle Building",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80",
    match: "98.8%",
    detectedName: "Chicken Breast & Grain Plate",
    calories: 610,
    protein: 48,
    carbs: 58,
    fat: 11,
    remark:
      "High protein with clean complex carbohydrates for steady glycogen replenishment.",
  },
  {
    name: "Avocado Poached Egg Toast",
    tag: "Healthy Fats & Fiber",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80",
    match: "99.1%",
    detectedName: "Avocado Sourdough Toast",
    calories: 390,
    protein: 16,
    carbs: 36,
    fat: 21,
    remark:
      "Rich in monounsaturated fats, dietary fiber, and micronutrients for sustained morning focus.",
  },
];

const FAQ_ITEMS_EN = [
  {
    question: "How does Google Gemini detect meals from photos?",
    answer:
      "Google Gemini vision models analyze texture, ingredients, and portion proportions directly from your meal photo. The results are cross-referenced with Edamam and FatSecret clinical nutrition databases to compute exact macros and calorie estimates.",
  },
  {
    question: "Can it recognize local Indonesian & international cuisines?",
    answer:
      "Yes! Gemini is trained on millions of global dishes, including Indonesian staples like Nasi Goreng, Rendang, Gado-Gado, Sate, and Tempeh. You can also search through 100,000+ foods using the 'Search Food' tool.",
  },
  {
    question: "How does the weekly health PDF export work?",
    answer:
      "Every meal logged is consolidated into a clinical summary. At any time, click 'Export PDF' in your dashboard to generate a clean, shareable report with daily deficit charts and AI coaching advice for your nutritionist or physician.",
  },
  {
    question: "Is Dietary completely free to use?",
    answer:
      "Yes. All core features—Gemini AI food scanner, 100,000+ verified food database, macro tracking, hydration tracker, and PDF exports—are 100% free with no credit card required.",
  },
];

const FAQ_ITEMS_ID = [
  {
    question: "Bagaimana cara Google Gemini mendeteksi makanan dari foto?",
    answer:
      "Model vision Google Gemini menganalisis tekstur visual, porsi, dan bahan makanan pada foto piring Anda secara langsung. Hasil deteksi kemudian dicocokkan otomatis dengan basis data gizi klinis Edamam & FatSecret untuk menghitung gramasi dan estimasi kalorinya.",
  },
  {
    question: "Apakah Dietary bisa mengenali makanan lokal Indonesia?",
    answer:
      "Tentu saja! Gemini dilatih dengan jutaan data kuliner internasional dan Nusantara—seperti Nasi Goreng, Rendang, Gado-Gado, Sate, hingga Tempe Goreng. Selain lewat foto, Anda juga bisa mencari ribuan menu lokal lewat menu 'Search Food'.",
  },
  {
    question: "Bagaimana cara kerja laporan nutrisi mingguan (PDF Export)?",
    answer:
      "Setiap makanan yang Anda catat akan dirangkum otomatis. Kapan saja, Anda bisa menekan tombol 'Export PDF' di dashboard untuk mengunduh laporan klinis lengkap berisi grafik asupan kalori, status defisit, dan saran asisten AI untuk dokter atau nutrisionis Anda.",
  },
  {
    question: "Apakah saya harus membayar biaya langganan?",
    answer:
      "Tidak. Seluruh fitur utama Dietary—mulai dari deteksi AI Gemini, database 100.000+ makanan, pelacak hidrasi, hingga ekspor PDF—tersedia 100% gratis tanpa kartu kredit.",
  },
];

const LandingView = () => {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const [activeSampleMeal, setActiveSampleMeal] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  // TDEE Calculator States
  const [calcGender, setCalcGender] = useState("male");
  const [calcAge, setCalcAge] = useState(25);
  const [calcWeight, setCalcWeight] = useState(70);
  const [calcHeight, setCalcHeight] = useState(170);
  const [calcActivity, setCalcActivity] = useState(1.375);

  const calculatedTdee = useMemo(() => {
    const w = Number(calcWeight) || 70;
    const h = Number(calcHeight) || 170;
    const a = Number(calcAge) || 25;
    const act = Number(calcActivity) || 1.375;
    let bmr = 10 * w + 6.25 * h - 5 * a;
    if (calcGender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    return Math.max(1200, Math.round(bmr * act));
  }, [calcGender, calcAge, calcWeight, calcHeight, calcActivity]);

  const currentMeal = SAMPLE_MEALS[activeSampleMeal];
  const faqList = isEn ? FAQ_ITEMS_EN : FAQ_ITEMS_ID;

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-20 sm:space-y-24 animate-fade-in max-w-6xl mx-auto">
      {/* 1. Hero Section */}
      <section className="max-w-3xl space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          {isEn ? "AI-Powered Nutrition Intelligence" : "Kecerdasan Nutrisi Bertenaga AI"}
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
            {isEn ? "Get Started for Free" : "Mulai Sekarang Gratis"}
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <Link
            to="/detect"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-800 font-semibold text-sm rounded-xl hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] transition-all"
          >
            <svg
              className="w-4 h-4 text-zinc-500"
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
            {isEn ? "Try Food Detection" : "Coba Deteksi Makanan"}
          </Link>
        </div>
      </section>

      {/* 2. Interactive Product Mockup / App Preview with Food Switcher */}
      <section className="w-full max-w-5xl space-y-4">
        {/* Interactive Meal Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 mr-1 hidden sm:inline">
            {isEn ? "Select Sample Plate:" : "Pilih Contoh Piring:"}
          </span>
          {SAMPLE_MEALS.map((meal, index) => (
            <button
              key={meal.name}
              onClick={() => setActiveSampleMeal(index)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                activeSampleMeal === index
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {index === 0 ? "🥗 Salad Bowl" : index === 1 ? "🍗 Herb Chicken" : "🥑 Avocado Toast"}
            </button>
          ))}
        </div>

        <div className="relative rounded-2xl border border-zinc-200/80 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] overflow-hidden text-left">
          {/* Window Topbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/70">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-[11px] font-mono text-zinc-400">
                dietary.app / live-food-detection
              </span>
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
                src={currentMeal.image}
                alt={currentMeal.name}
                className="w-full h-72 sm:h-96 md:h-full object-cover opacity-90 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

              {/* Floating Scanner Box */}
              <div className="absolute top-6 left-6 right-6 bottom-6 border-2 border-dashed border-blue-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                <div className="self-start bg-zinc-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Target Detected: {currentMeal.detectedName}
                </div>
                <div className="self-end bg-blue-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                  {currentMeal.match} Match
                </div>
              </div>
            </div>

            {/* Right Analysis Breakdown */}
            <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Classified Meal
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {currentMeal.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900">
                  {currentMeal.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Verified through FatSecret & Edamam nutrition database engines.
                </p>
              </div>

              {/* Macro Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[11px] font-medium text-zinc-400 block">
                    Total Calories
                  </span>
                  <span className="text-xl font-extrabold text-zinc-900 tabular-nums">
                    {currentMeal.calories}{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      kcal
                    </span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[11px] font-medium text-blue-600 block">
                    Protein
                  </span>
                  <span className="text-xl font-extrabold text-blue-900 tabular-nums">
                    {currentMeal.protein}{" "}
                    <span className="text-xs font-normal text-blue-600">
                      g
                    </span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[11px] font-medium text-amber-600 block">
                    Carbs
                  </span>
                  <span className="text-xl font-extrabold text-amber-900 tabular-nums">
                    {currentMeal.carbs}{" "}
                    <span className="text-xs font-normal text-amber-600">
                      g
                    </span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                  <span className="text-[11px] font-medium text-rose-600 block">
                    Healthy Fats
                  </span>
                  <span className="text-xl font-extrabold text-rose-900 tabular-nums">
                    {currentMeal.fat}{" "}
                    <span className="text-xs font-normal text-rose-600">
                      g
                    </span>
                  </span>
                </div>
              </div>

              {/* AI Assistant Remark */}
              <div className="p-3.5 rounded-xl bg-zinc-900 text-white text-xs leading-relaxed flex items-start gap-3 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <p className="text-[11px] text-zinc-300">
                  <strong className="text-white font-semibold">
                    AI Coach:
                  </strong>{" "}
                  {currentMeal.remark}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Quick TDEE & Calorie Calculator */}
      <section className="w-full max-w-4xl bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-10 shadow-sm text-left">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            {isEn ? "Interactive Tool" : "Alat Interaktif"}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            {isEn ? "Instant Calorie Target (TDEE) Calculator" : "Kalkulator Kebutuhan Kalori Instan (TDEE)"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5">
            {isEn
              ? "Calculate your daily maintenance and target calories based on your metabolic profile."
              : "Cari tahu berapa banyak kalori yang dibutuhkan tubuh Anda setiap hari untuk menjaga, menurunkan, atau menaikkan berat badan."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Form Inputs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                {isEn ? "Gender" : "Jenis Kelamin"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalcGender("male")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    calcGender === "male"
                      ? "bg-blue-50 border-blue-600 text-blue-700"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {isEn ? "Male" : "Laki-laki"}
                </button>
                <button
                  type="button"
                  onClick={() => setCalcGender("female")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    calcGender === "female"
                      ? "bg-blue-50 border-blue-600 text-blue-700"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {isEn ? "Female" : "Perempuan"}
                </button>
              </div>
            </div>

            {/* Age, Weight, Height */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {isEn ? "Age (yrs)" : "Usia (thn)"}
                </label>
                <input
                  type="number"
                  min="15"
                  max="100"
                  value={calcAge}
                  onChange={(e) => setCalcAge(e.target.value)}
                  className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {isEn ? "Weight (kg)" : "Berat (kg)"}
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {isEn ? "Height (cm)" : "Tinggi (cm)"}
                </label>
                <input
                  type="number"
                  min="100"
                  max="230"
                  value={calcHeight}
                  onChange={(e) => setCalcHeight(e.target.value)}
                  className="w-full text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {isEn ? "Daily Activity Level" : "Tingkat Aktivitas Harian"}
              </label>
              <select
                value={calcActivity}
                onChange={(e) => setCalcActivity(parseFloat(e.target.value))}
                className="w-full text-xs font-medium bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                <option value={1.2}>
                  {isEn ? "Sedentary (desk job, minimal movement)" : "Sedentary (Jarang bergerak / kerja kantoran)"}
                </option>
                <option value={1.375}>
                  {isEn ? "Lightly Active (light exercise 1-3 days/week)" : "Lightly Active (Olahraga ringan 1-3 hari/minggu)"}
                </option>
                <option value={1.55}>
                  {isEn ? "Moderately Active (moderate training 3-5 days/week)" : "Moderately Active (Olahraga sedang 3-5 hari/minggu)"}
                </option>
                <option value={1.725}>
                  {isEn ? "Very Active (hard training 6-7 days/week)" : "Very Active (Latihan berat 6-7 hari/minggu)"}
                </option>
              </select>
            </div>
          </div>

          {/* Live Result Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white p-6 sm:p-7 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                {isEn ? "Your Daily Calorie Requirement" : "Kebutuhan Kalori Harian Anda"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-white">
                  {calculatedTdee.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-zinc-400">
                  {isEn ? "kcal/day" : "kcal/hari"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                {isEn
                  ? "Estimated maintenance calories based on the Mifflin-St Jeor metabolic standard."
                  : "Estimasi kalori pemeliharaan (maintenance) metabolisme tubuh Anda berdasarkan standar Mifflin-St Jeor."}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>{isEn ? "Fat Loss Deficit (-400 kcal)" : "Defisit Penurunan Berat (-400 kcal)"}</span>
                <strong className="text-emerald-400 font-semibold">
                  {Math.max(1200, calculatedTdee - 400)} kcal
                </strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-300">
                <span>{isEn ? "Lean Muscle Surplus (+300 kcal)" : "Surplus Pembentukan Otot (+300 kcal)"}</span>
                <strong className="text-blue-400 font-semibold">
                  {calculatedTdee + 300} kcal
                </strong>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl text-center shadow-md transition active:scale-[0.98]"
            >
              {isEn ? "Set This Target & Start Free" : "Gunakan Target Ini & Daftar Gratis"}
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How It Works - 3 Step Flow */}
      <section className="w-full max-w-5xl space-y-12">
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Workflow
          </h2>
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
            <span className="text-4xl font-black text-zinc-100 absolute top-4 right-4 select-none">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <svg
                className="w-5 h-5"
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
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">
                Snap or Search Meal
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Take a photo of your plate or search through over 100,000
                verified foods in our database.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
              Zero manual math <span aria-hidden="true">→</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
            <span className="text-4xl font-black text-zinc-100 absolute top-4 right-4 select-none">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">
                Instant AI Breakdown
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Google Gemini scans ingredients, portion weights, and
                retrieves clinical caloric data in under a second.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              Clinically verified <span aria-hidden="true">→</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
            <span className="text-4xl font-black text-zinc-100 absolute top-4 right-4 select-none">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">
                Weekly Reports & Coach
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Monitor your daily deficit, chat with your nutrition coach,
                and download one-click PDF summaries for your doctor.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              Export to PDF <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust & Precision Metrics */}
      <section className="w-full max-w-5xl py-8 px-6 bg-white rounded-2xl border border-zinc-200/80 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tabular-nums">
              100k+
            </span>
            <p className="text-xs text-zinc-500 font-medium">
              Verified Foods
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tabular-nums">
              &lt; 1.2s
            </span>
            <p className="text-xs text-zinc-500 font-medium">
              Gemini Detection Time
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              100%
            </span>
            <p className="text-xs text-zinc-500 font-medium">Free To Use</p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tabular-nums">
              PDF
            </span>
            <p className="text-xs text-zinc-500 font-medium">
              Weekly Health Reports
            </p>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) Accordion */}
      <section className="w-full max-w-4xl space-y-6 text-left">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            {isEn ? "Got Questions?" : "Pertanyaan Populer"}
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-zinc-50/70 transition-colors"
                >
                  <span className="text-sm font-bold text-zinc-900">
                    {faq.question}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-500 text-xs font-bold">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Ready to Transform CTA Section */}
      <section className="w-full max-w-4xl bg-gradient-to-b from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-5">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to take control of your diet?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Join thousands of users who simplified their meal logging with
            computer vision. No subscription fees required.
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

      {/* 8. Trusted Attribution & Footer */}
      <footer className="pt-8 border-t border-zinc-200/60 w-full max-w-4xl flex flex-col items-center justify-center space-y-4">
        <p className="text-[11px] font-bold text-zinc-400 tracking-widest uppercase">
          Verified Clinical Data Partners
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-75 hover:opacity-100 transition-opacity duration-200">
          <a
            href="https://platform.fatsecret.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              alt="FatSecret API"
              src="https://platform.fatsecret.com/api/static/images/powered_by_fatsecret_horizontal_brand.svg"
              className="h-6"
            />
          </a>
          <a
            href="https://www.edamam.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <img
              alt="Edamam"
              src="https://developer.edamam.com/images/transparent.png"
              className="h-7"
            />
          </a>
        </div>
        <p className="text-[11px] text-zinc-400 pt-2">
          © {new Date().getFullYear()} Dietary. Precision Nutrition
          Intelligence.
        </p>
      </footer>
    </div>
  );
};

export default LandingView;
