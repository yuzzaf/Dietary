import { useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLogs, deleteLog } from "../../services/logService";
import { formatCalories } from "../../utils/formatCalories";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../../components/common/Loader";

const Logs = () => {
  const queryClient = useQueryClient();
  const root = useRef(null);
  const { data: results, isLoading } = useQuery({
    queryKey: ["logs-all"],
    queryFn: getLogs,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLog(id),
    onSuccess: () => {
      toast.success("Log deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["logs-all"] });
      queryClient.invalidateQueries({ queryKey: ["logs-today"] });
      queryClient.invalidateQueries({ queryKey: ["ai-insight"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });

  const logs = useMemo(
    () => results?.logs || (Array.isArray(results) ? results : []),
    [results]
  );

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

  if (isLoading) return <Loader />;

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Entry?",
      text: "This recorded meal and its caloric value will be removed from your logs.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl border border-zinc-200 text-sm",
        confirmButton: "rounded-xl text-xs font-semibold px-4 py-2",
        cancelButton: "rounded-xl text-xs font-semibold px-4 py-2",
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
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Intake History
          </h1>
          <p className="text-xs text-zinc-500">
            Review past meals, time logs, and macronutrient contributions.
          </p>
        </header>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100">
                <thead className="bg-zinc-50/60">
                  <tr>
                    <th className="w-full px-5 py-3 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Food Item
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Date & Time
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Calories
                    </th>
                    <th className="px-5 py-3 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                      Action
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
                          title="Delete entry"
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
                          Delete
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
              <p className="text-xs font-semibold text-zinc-700">No activity history recorded.</p>
              <p className="text-[11px] text-zinc-400">Meals you scan or search will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
