import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { sendChatMessage } from '../../services/insightService';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am your AI Nutrition Coach. How can I help you with your diet today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isAuthenticated) return null;

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', text: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Remove the last item (current user msg) to pass the previous history properly to Gemini history if needed, 
      // but the API wrapper we made accepts the whole history before this message.
      const historyToPass = messages.length > 1 ? messages.slice(1) : []; 
      const reply = await sendChatMessage(userMessage, historyToPass);
      setMessages([...newHistory, { role: 'model', text: reply }]);
    } catch (error) {
      toast.error('AI is struggling to answer right now.');
      setMessages([...newHistory, { role: 'model', text: 'Sorry, I am having trouble connecting to the server. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/90 backdrop-blur-xl w-80 sm:w-96 rounded-3xl shadow-2xl border border-gray-100 mb-4 overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm -rotate-12">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Nutrition AI</h3>
                <p className="text-[10px] text-blue-100">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-blue-100 hover:text-white transition bg-blue-700/50 p-1.5 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50/50 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-bl-none p-3 max-w-[80%] text-sm flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about calories..."
              className="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className={`bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute pointer-events-none' : 'rotate-0 opacity-100'}`}
      >
        <div className="absolute inset-0 bg-blue-400 rounded-full mix-blend-multiply opacity-0 group-hover:opacity-50 transition blur-md" />
        <svg className="w-7 h-7 relative z-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default Chatbot;
