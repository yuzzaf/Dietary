import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { detectFoodImage } from "../../services/foodService";
import { createLog } from "../../services/logService";
import toast from "react-hot-toast";
import { formatCalories } from "../../utils/formatCalories";
import { useLanguage } from "../../context/LanguageContext";

const Detect = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const root = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isEn = lang === "en";

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector(".detect-container");
      if (container) {
        container.animate(
          [
            { transform: "translateY(16px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 400,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          },
        );
      }
    }
  }, []);

  useEffect(() => {
    if (detectionResult && root.current) {
      const resultEl = root.current.querySelector(".detect-result");
      if (resultEl) {
        resultEl.animate(
          [
            { transform: "scale(0.98)", opacity: 0 },
            { transform: "scale(1)", opacity: 1 },
          ],
          {
            duration: 350,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          },
        );
      }
    }
  }, [detectionResult]);

  const detectMutation = useMutation({
    mutationFn: (formData) => detectFoodImage(formData),
    onSuccess: (data) => {
      setDetectionResult(data);
      setQuantity(1);
      toast.success(
        isEn
          ? "Food detected successfully!"
          : "Makanan berhasil terdeteksi!",
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          (isEn ? "Detection failed. Please try another photo." : "Deteksi gagal. Coba foto lain."),
      );
    },
  });

  const logMutation = useMutation({
    mutationFn: (logData) => createLog(logData),
    onSuccess: () => {
      toast.success(
        isEn
          ? "Food logged to your daily intake!"
          : "Makanan berhasil ditambahkan ke riwayat harian!",
      );
      setDetectionResult(null);
      setSelectedImage(null);
      setPreviewUrl(null);
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          (isEn ? "Failed to log meal." : "Gagal mencatat makanan."),
      );
    },
  });

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        isEn
          ? "Please upload a valid image file (JPEG, PNG, WebP)."
          : "Mohon unggah file gambar yang valid (JPEG, PNG, WebP).",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        isEn
          ? "File size exceeds 10MB limit. Please choose a smaller photo."
          : "Ukuran file melebihi 10MB. Silakan pilih foto yang lebih kecil.",
      );
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDetectionResult(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDetect = () => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append("image", selectedImage);
    detectMutation.mutate(formData);
  };

  const bestMatch = detectionResult?.options?.[0];

  const handleLog = () => {
    if (!bestMatch) return;
    logMutation.mutate({
      name: bestMatch.name,
      calories: bestMatch.calories,
      protein: bestMatch.protein,
      fat: bestMatch.fat,
      carbs: bestMatch.carbs,
      source: bestMatch.source,
      externalId: bestMatch.externalId,
      quantity: Number(quantity) || 1,
    });
  };

  return (
    <div ref={root} className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="detect-container opacity-0 space-y-6">
        {/* Header */}
        <header className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
            Google Gemini Vision
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {isEn ? "AI Meal Scanner" : "Pemindai Makanan AI"}
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {isEn
              ? "Upload or capture a photo of your food. Computer vision identifies ingredients and calculates calories."
              : "Unggah atau foto hidangan makanan Anda. AI akan mengidentifikasi bahan dan mengestimasi kalorinya."}
          </p>
        </header>

        {/* Upload Card */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center">
          {previewUrl ? (
            <div className="relative w-full aspect-square max-w-xs rounded-2xl overflow-hidden mb-5 border border-zinc-200 shadow-sm group">
              <img
                src={previewUrl}
                alt="Meal Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                  setDetectionResult(null);
                }}
                title={isEn ? "Remove photo" : "Hapus foto"}
                className="absolute top-3 right-3 w-8 h-8 bg-zinc-900/80 hover:bg-zinc-900 text-white rounded-full flex items-center justify-center backdrop-blur-sm shadow-md transition cursor-pointer"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full aspect-square max-w-xs flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition mb-5 text-center p-6 ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                  : "border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-zinc-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-700">
                    {isDragging
                      ? isEn
                        ? "Drop your meal photo here"
                        : "Lepaskan foto makanan di sini"
                      : isEn
                        ? "Choose or drop photo"
                        : "Pilih atau seret foto"}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    JPEG, PNG, WebP up to 10MB
                  </p>
                </div>

                {/* Dual Quick Buttons: Direct Camera vs Gallery Upload */}
                <div className="flex gap-2 pt-1 w-full max-w-[220px]">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 rounded-lg border border-zinc-200 text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
                  >
                    <span>📷</span>
                    <span>{isEn ? "Camera" : "Kamera"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100/80 text-blue-700 rounded-lg border border-blue-100 text-[11px] font-semibold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer active:scale-95"
                  >
                    <span>📁</span>
                    <span>{isEn ? "Gallery" : "Galeri"}</span>
                  </button>
                </div>
              </div>

              {/* Direct Smartphone Camera Input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />

              {/* Standard Gallery File Input */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          )}

          <button
            onClick={handleDetect}
            disabled={!selectedImage || detectMutation.isPending}
            className={`w-full max-w-xs py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98] ${
              !selectedImage || detectMutation.isPending
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-sm"
            }`}
          >
            {detectMutation.isPending
              ? isEn
                ? "Analyzing Meal with Gemini AI..."
                : "Menganalisis Makanan dengan Gemini AI..."
              : isEn
                ? "Scan Nutrition"
                : "Pindai Nutrisi"}
          </button>
        </div>

        {/* Results Card */}
        {detectionResult && (
          <div className="detect-result opacity-0 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {isEn ? "Analysis Results" : "Hasil Analisis"}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                AI Match: {detectionResult.detected}
              </span>
            </div>

            {bestMatch ? (
              <div className="flex justify-between items-center bg-zinc-50/70 p-4 rounded-xl border border-zinc-100">
                <div>
                  <p className="text-base font-bold text-zinc-900 capitalize">
                    {bestMatch.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Source:{" "}
                    <span className="font-medium text-zinc-700 capitalize">
                      {bestMatch.source || "Database"}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-blue-600 tabular-nums">
                    {formatCalories(bestMatch.calories)}
                  </p>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">
                    per serving
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-zinc-50/60 rounded-xl border border-zinc-100">
                <p className="text-xs text-zinc-500">
                  {isEn ? (
                    <>
                      Identified as{" "}
                      <strong className="text-zinc-900 capitalize">
                        "{detectionResult.detected}"
                      </strong>
                      , but exact nutritional data wasn't found in database.
                    </>
                  ) : (
                    <>
                      Terdeteksi sebagai{" "}
                      <strong className="text-zinc-900 capitalize">
                        "{detectionResult.detected}"
                      </strong>
                      , namun data gizi spesifik belum tersedia di database.
                    </>
                  )}
                </p>
                <Link
                  to="/search"
                  className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-block"
                >
                  {isEn
                    ? "Search food database manually →"
                    : "Cari database makanan secara manual →"}
                </Link>
              </div>
            )}

            {isAuthenticated ? (
              <div className="space-y-3 pt-2">
                {bestMatch && (
                  <div className="flex items-center justify-between bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-100 text-xs">
                    <span className="font-semibold text-zinc-700">
                      {isEn ? "Portion multiplier:" : "Jumlah Porsi:"}
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-16 px-2.5 py-1 text-center bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900 focus:outline-none focus:border-blue-600 tabular-nums"
                      />
                      <span className="text-zinc-500">
                        Total:{" "}
                        <strong className="text-blue-600 tabular-nums">
                          {formatCalories(
                            bestMatch.calories * quantity || bestMatch.calories,
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLog}
                  disabled={logMutation.isPending || !bestMatch}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer active:scale-[0.98] ${
                    !bestMatch || logMutation.isPending
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  }`}
                >
                  {logMutation.isPending
                    ? isEn
                      ? "Logging to Intake..."
                      : "Menyimpan ke Riwayat..."
                    : isEn
                      ? "Add to Daily Intake"
                      : "Tambahkan ke Makanan Hari Ini"}
                </button>
              </div>
            ) : (
              <div className="text-center p-3 bg-zinc-50 rounded-xl text-xs text-zinc-500">
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {isEn ? "Sign in" : "Masuk"}
                </Link>{" "}
                {isEn
                  ? "to save this meal into your personal dashboard."
                  : "untuk menyimpan makanan ini ke dashboard pribadi Anda."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Detect;
