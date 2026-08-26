import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Layout from '../components/AppShell/Layout';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';
import { getSocket } from '../services/socket';
import {
  Sparkles,
  GitBranch,
  Play,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Cpu,
  Terminal,
  Zap,
  Radio,
  Layers,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState({
    metrics: {},
    recentExecutions: [],
    recentWorkflows: []
  });
  const [loading, setLoading] = useState(true);
  const [promptInput, setPromptInput] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflows/dashboard');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const socket = getSocket();
    if (!socket) return;

    const handleExecutionUpdate = () => {
      fetchDashboardData();
    };

    socket.on('executions:list_update', handleExecutionUpdate);
    return () => {
      socket.off('executions:list_update', handleExecutionUpdate);
    };
  }, []);

  const handleQuickPromptSubmit = (e) => {
    e.preventDefault();
    if (promptInput.trim()) {
      router.push(`/workflows/builder?prompt=${encodeURIComponent(promptInput.trim())}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            Running
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Failed
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans">
          {/* Quick AI Workflow Prompt Synthesizer Box */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>RUNA AI Synthesizer • (You define it. We run it.)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                What would you like RUNA to run today?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Connect **WhatsApp, Telegram, LinkedIn, Instagram, Facebook, or Sheets** in seconds. Describe what to trigger, how AI should reason, and where to post or dispatch.
              </p>

              {/* Prompt Input Form */}
              <form onSubmit={handleQuickPromptSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Terminal className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Generate weekly LinkedIn & Instagram posts using Gemini AI and alert on Telegram"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition shadow-soft-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-100 transition hover:scale-105 active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize</span>
                </button>
              </form>
            </div>
          </div>

          {/* Metrics Grid */}
          <MetricGrid metrics={data.metrics} />

          {/* Dual Panel: Active Workflows & Live Execution Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Workflows Panel */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-soft-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Workflows</h3>
                    <p className="text-xs text-slate-400">Configured automation blueprints</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/workflows')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  View catalog
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Workflows List */}
              <div className="space-y-3 pt-1">
                {data.recentWorkflows && data.recentWorkflows.length > 0 ? (
                  data.recentWorkflows.map((wf) => (
                    <div
                      key={wf._id}
                      onClick={() => router.push(`/workflows/${wf._id}`)}
                      className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                            {wf.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                            v{wf.version || 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {wf.description || 'Custom multi-agent DAG pipeline.'}
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          {(wf.tags || []).slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/workflows/${wf._id}`);
                          }}
                          className="p-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 transition shadow-soft-sm"
                          title="Open Canvas"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">No workflows configured yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Swarm Telemetry Stream */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 space-y-4 shadow-soft-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Live Swarm Executions</h3>
                    <p className="text-xs text-slate-400">Real-time socket execution traces</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/executions')}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  View audit log
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Execution Rows */}
              <div className="space-y-3 pt-1">
                {data.recentExecutions && data.recentExecutions.length > 0 ? (
                  data.recentExecutions.map((exec) => (
                    <div
                      key={exec._id}
                      onClick={() => router.push(`/executions/${exec._id}`)}
                      className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:border-purple-300 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                            {exec.workflowSnapshot?.name || 'Execution Run'}
                          </h4>
                          {getStatusBadge(exec.status)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'In progress'}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(exec.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          {exec.retryCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-semibold">{exec.retryCount} Retries</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">No execution runs recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
