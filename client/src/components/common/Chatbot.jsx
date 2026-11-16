import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { sendChatMessage } from "../../services/insightService";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

const Chatbot = () => {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: isEn
        ? "Hi! I'm your AI Nutrition Assistant. Ask me anything about calories, macro goals, or healthy food choices."
        : "Halo! Saya Asisten Nutrisi AI Anda. Tanyakan apa saja tentang kalori, target nutrisi, atau pilihan makanan sehat.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen || isLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const apiUrl = (rawApiUrl.startsWith("http://") || rawApiUrl.startsWith("https://"))
        ? rawApiUrl
        : `https://${rawApiUrl}`;
      const socketUrl = apiUrl.replace(/\/api\/?$/, "") || undefined;
      socketRef.current = io(socketUrl);

      socketRef.current.on("chat-stream", (data) => {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "model") {
            return [
              ...prev.slice(0, -1),
              { role: "model", text: lastMsg.text + data.text },
            ];
          }
          return prev;
        });
        if (data.isDone) {
          setIsLoading(false);
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isAuthenticated]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isAuthenticated) {
      toast(
        isEn
          ? "Please sign in to chat with the AI Nutrition Assistant"
          : "Silakan masuk untuk mengobrol dengan Asisten Nutrisi AI",
        { icon: "🔒" },
      );
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const socketId = socketRef.current?.id;
      setMessages((prev) => [...prev, { role: "model", text: "" }]);

      const outgoingHistory = messages.filter(
        (m, i) => !(i === 0 && m.role === "model"),
      );

      const response = await sendChatMessage(
        userMessage,
        outgoingHistory,
        socketId,
      );

      if (!socketId) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "model", text: response.reply },
        ]);
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "model",
          text: isEn
            ? "Sorry, I am having trouble connecting to the AI server. Please try again later."
            : "Maaf, terjadi kendala saat menghubungi server AI. Silakan coba lagi nanti.",
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] max-h-[75vh] rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-zinc-200/90 mb-3 overflow-hidden flex flex-col animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="bg-zinc-900 p-3.5 text-white flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
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
              <div>
                <h3 className="font-semibold text-xs tracking-tight text-white flex items-center gap-1.5">
                  AI Nutrition Coach
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-zinc-400">Powered by Gemini 2.5</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-zinc-400 hover:text-white transition p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
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

          <div
            ref={messagesContainerRef}
            className="flex-1 p-3.5 h-80 overflow-y-auto bg-zinc-50/50 flex flex-col gap-2.5"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
                      : "bg-white border border-zinc-200/80 text-zinc-800 rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200/80 text-zinc-400 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-xs flex gap-1 items-center shadow-sm">
                  <span
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t border-zinc-100 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEn ? "Ask about your diet or calories..." : "Tanyakan seputar diet atau kalori Anda..."}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <svg
                className="w-3.5 h-3.5 ml-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={toggleChat}
        className={`bg-zinc-900 text-white p-3.5 rounded-full shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer ${
          isOpen ? "rotate-90 scale-0 opacity-0 absolute pointer-events-none" : "rotate-0 opacity-100"
        }`}
      >
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
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `,
        }}
      />
    </div>
  );
};

export default Chatbot;