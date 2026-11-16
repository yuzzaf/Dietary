import { useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLogs, deleteLog } from "../../services/logService";
import { formatCalories } from "../../utils/formatCalories";
import { formatDate } from "../../utils/formatDate";
import { useLanguage } from "../../context/LanguageContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const LogsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm animate-pulse space-y-2"
        >
          <div className="h-3 bg-zinc-100 rounded-md w-1/2" />
          <div className="h-6 bg-zinc-200 rounded-md w-2/3" />
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100">
          <div className="space-y-1.5 w-1/3">
            <div className="h-3.5 bg-zinc-200 rounded-md" />
            <div className="h-2.5 bg-zinc-100 rounded-md w-2/3" />
          </div>
          <div className="h-4 bg-zinc-100 rounded-md w-1/4" />
          <div className="h-6 bg-zinc-100 rounded-lg w-12" />
        </div>
      ))}
    </div>
  </div>
);

const Logs = () => {
  const queryClient = useQueryClient();
  const root = useRef(null);
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const { data: results, isLoading } = useQuery({
    queryKey: ["logs-all"],
    queryFn: getLogs,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLog(id),
    onSuccess: () => {
      toast.success(isEn ? "Log deleted successfully" : "Catatan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["logs-all"] });
      queryClient.invalidateQueries({ queryKey: ["logs-today"] });
      queryClient.invalidateQueries({ queryKey: ["ai-insight"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || (isEn ? "Delete failed" : "Gagal menghapus"),
      );
    },
  });

  const logs = useMemo(
    () => results?.logs || (Array.isArray(results) ? results : []),
    [results],
  );

  const stats = useMemo(() => {
    if (!logs.length) return { totalMeals: 0, totalCalories: 0, avgCalories: 0 };
    const totalCalories = logs.reduce(
      (acc, log) => acc + (Number(log.Food?.calories || 0) * (log.quantity || 1)),
      0,
    );
    const avgCalories = Math.round(totalCalories / logs.length);
    return { totalMeals: logs.length, totalCalories, avgCalories };
  }, [logs]);

  useEffect(() => {
    if (!isLoading && root.current) {
      const container = root.current.querySelector(".logs-container");
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
  }, [isLoading]);

  useEffect(() => {
    if (logs.length > 0 && root.current) {
      const logItems = root.current.querySelectorAll(".history-log-item");
      logItems.forEach((el, index) => {
        el.animate(
          [
            { transform: "translateY(10px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 300,
            delay: index * 40,
            easing: "ease-out",
            fill: "forwards",
          },
        );
      });
    }
  }, [logs]);

  const handleDelete = (id) => {
    Swal.fire({
      title: isEn ? "Delete Entry?" : "Hapus Catatan?",
      text: isEn
        ? "This recorded meal and its caloric value will be removed from your logs."
        : "Catatan makanan dan kalorinya akan dihapus dari riwayat Anda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#71717a",
      confirmButtonText: isEn ? "Yes, delete" : "Ya, hapus",
      cancelButtonText: isEn ? "Cancel" : "Batal",
      customClass: {
        popup: "rounded-2xl border border-zinc-200 text-sm",
        confirmButton: "rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer",
        cancelButton: "rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div ref={root} className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="logs-container opacity-0 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {isEn ? "Intake History" : "Riwayat Asupan"}
          </h1>
          <p className="text-xs text-zinc-500">
            {isEn
              ? "Review past recorded meals, consumption times, and caloric breakdown."
              : "Tinjau riwayat makanan yang telah dicatat, waktu konsumsi, dan rincian kalori."}
          </p>
        </header>

        {isLoading ? (
          <LogsSkeleton />
        ) : (
          <>
            {logs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isEn ? "Total Logged" : "Total Makanan"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-zinc-900 tabular-nums">
                      {stats.totalMeals}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {isEn ? "items" : "item"}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isEn ? "Average Calories" : "Rata-rata Kalori"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-blue-600 tabular-nums">
                      {stats.avgCalories.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">kcal/meal</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isEn ? "Total Energy" : "Total Energi"}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-zinc-900 tabular-nums">
                      {stats.totalCalories.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">kcal</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
              {logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-100">
                    <thead className="bg-zinc-50/60">
                      <tr>
                        <th className="w-full px-5 py-3 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          {isEn ? "Food Item" : "Makanan"}
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                          {isEn ? "Date & Time" : "Waktu"}
                        </th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                          {isEn ? "Calories" : "Kalori"}
                        </th>
                        <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                          {isEn ? "Action" : "Aksi"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-100">
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          className="history-log-item hover:bg-zinc-50/60 transition-colors opacity-0"
                        >
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-900 capitalize">
                                {log.Food?.name || "Meal Item"}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-medium px-1.5 py-0.5 bg-zinc-100 rounded-md">
                                &times;{log.quantity || 1}
                              </span>
                            </div>
                            {log.mealType && (
                              <div className="text-[10px] text-zinc-400 capitalize mt-0.5">
                                {log.mealType}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                            <div className="text-zinc-700 font-medium">
                              {formatDate(log.consumedAt || log.createdAt)}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {new Date(
                                log.consumedAt || log.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-bold text-zinc-900 tabular-nums">
                            {formatCalories(log.Food?.calories * log.quantity || 0)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-medium cursor-pointer"
                              title={isEn ? "Delete entry" : "Hapus catatan"}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {isEn ? "Delete" : "Hapus"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 px-4 space-y-2">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-3">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-zinc-700">
                    {isEn ? "No activity history recorded." : "Belum ada riwayat aktivitas."}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {isEn
                      ? "Meals you scan or search will appear here."
                      : "Makanan yang Anda pindai atau cari akan muncul di sini."}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
