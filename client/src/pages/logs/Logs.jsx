import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
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
      toast.success("Log deleted");
      queryClient.invalidateQueries({ queryKey: ["logs-all"] });
      queryClient.invalidateQueries({ queryKey: ["logs-today"] });
      queryClient.invalidateQueries({ queryKey: ["ai-insight"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });

  const logs = results?.logs || (Array.isArray(results) ? results : []);

  useEffect(() => {
    if (!isLoading && root.current) {
      const container = root.current.querySelector(".logs-container");
      if (container) {
        container.animate(
          [
            { transform: "translateY(20px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 800,
            easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
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
            { transform: "translateY(15px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 400,
            delay: index * 50,
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
      title: "Delete Activity Log",
      text: "Are you sure you want to delete this log? This data cannot be recovered.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl text-sm font-bold px-5 py-2.5",
        cancelButton: "rounded-xl text-sm font-bold px-5 py-2.5",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div ref={root}>
      <div className="logs-container opacity-0 max-w-4xl mx-auto space-y-6 pb-12">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Activity History
            </h1>
            <p className="text-gray-500 mt-1">
              Review your past nutrition and calorie intake.
            </p>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-full px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Food
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      Calories
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="history-log-item hover:bg-gray-50 transition-colors opacity-0"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {log.Food?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded-md">
                            x{log.quantity || 1}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 capitalize mt-1">
                          {log.mealType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(log.consumedAt || log.createdAt)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(
                            log.consumedAt || log.createdAt,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900">
                        {formatCalories(log.Food?.calories * log.quantity || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors font-semibold active:scale-95"
                          title="Delete entry"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span className="text-sm">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <svg
                  className="w-10 h-10"
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
              <p className="text-gray-500 font-medium">No history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;
