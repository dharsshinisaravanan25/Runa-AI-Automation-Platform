import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  ArrowRight,
  Loader2,
  Minimize2,
  Maximize2,
  Wand2,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import api from '../../services/api';

const QUICK_PROMPTS = [
  'Add a WhatsApp alert step for +91 9345288285',
  'Add a Telegram broadcast node',
  'Add Google Sheets step to log outputs',
  'Explain what this workflow does'
];

export default function CanvasCopilot({
  workflowId,
  currentNodes,
  currentEdges,
  onApplyGraphUpdate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'copilot',
      text: '👋 Hi! I am your RUNA Canvas Co-Pilot. Tell me what steps to add, connect, or configure and I will modify your canvas in real time!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLastAction(null);

    try {
      const res = await api.post(`/workflows/${workflowId}/copilot`, {
        message: userMsg.text,
        currentNodes,
        currentEdges
      });

      const data = res.data?.data;
      if (data) {
        const copilotMsg = {
          id: `copilot_${Date.now()}`,
          sender: 'copilot',
          text: data.reply,
          actionTaken: data.actionTaken,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, copilotMsg]);

        // If the Co-Pilot updated the graph, apply to React Flow state!
        if (data.actionTaken === 'GRAPH_UPDATED' && data.nodes && onApplyGraphUpdate) {
          onApplyGraphUpdate(data.nodes, data.edges || currentEdges);
          setLastAction('Graph updated on canvas');
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          sender: 'copilot',
          text: `⚠️ Co-Pilot error: ${err.response?.data?.error?.message || err.message}`,
          isError: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Closed State Floating Launcher */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-xs shadow-soft-xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-white/20"
        >
          <div className="p-1 rounded-lg bg-white/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="tracking-wide font-bold">✨ AI Canvas Co-Pilot</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Open Floating Chat Drawer */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-32px)] h-[520px] rounded-3xl bg-white border border-slate-200/90 shadow-soft-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-soft-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>RUNA AI Co-Pilot</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Live
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">Pair-programming on canvas</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Notification Toast */}
          {lastAction && (
            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] font-semibold text-emerald-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lastAction}</span>
              </div>
              <button onClick={() => setLastAction(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'copilot' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-soft-sm rounded-br-none'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="rounded-2xl p-3 bg-slate-50 text-slate-500 border border-slate-200/80 flex items-center gap-2 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Modifying graph...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-100 overflow-x-auto flex items-center gap-1.5">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                disabled={loading}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 whitespace-nowrap transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
          >
            <input
              type="text"
              placeholder="e.g. Add WhatsApp node for +91..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shadow-soft-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
