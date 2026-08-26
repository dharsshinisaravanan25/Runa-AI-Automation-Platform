import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import Layout from '../../components/AppShell/Layout';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Filter,
  Loader2,
  RefreshCw,
  Zap,
  Terminal
} from 'lucide-react';

export default function ExecutionsListPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/executions', { params });
      setExecutions(res.data?.data?.executions || []);
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();

    const socket = getSocket();
    if (!socket) return;

    const handleExecutionUpdate = (updatedExec) => {
      setExecutions((prev) => {
        const id = updatedExec._id || updatedExec.id;
        const exists = prev.some((e) => e._id === id);
        if (exists) {
          return prev.map((e) => (e._id === id ? { ...e, ...updatedExec } : e));
        } else {
          return [updatedExec, ...prev];
        }
      });
    };

    socket.on('executions:list_update', handleExecutionUpdate);
    return () => {
      socket.off('executions:list_update', handleExecutionUpdate);
    };
  }, [statusFilter]);

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
      case 'RETRYING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            Retrying
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
        <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Executions Log
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time audit log of Agentra multi-agent swarm operations
              </p>
            </div>

            <button
              onClick={fetchExecutions}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-soft-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between gap-4 overflow-x-auto shadow-soft-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                Filter Status:
              </span>
              {['', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED'].map((st) => (
                <button
                  key={st || 'all'}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    statusFilter === st
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {st ? st : 'All Runs'}
                </button>
              ))}
            </div>
          </div>

          {/* Executions Table */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
                <p className="text-xs">Loading execution stream...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="text-center py-20">
                <PlayCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900">No execution traces found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Trigger an automation from the canvas to view real-time traces.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {executions.map((exec) => (
                  <div
                    key={exec._id}
                    onClick={() => router.push(`/executions/${exec._id}`)}
                    className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {exec.workflowSnapshot?.name || 'Automated Pipeline'}
                        </h4>
                        {getStatusBadge(exec.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="font-mono text-slate-500 text-[11px]">
                          ID: {exec._id?.slice(-8)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'In progress'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(exec.startTime).toLocaleString()}
                        </span>
                        {exec.retryCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold">{exec.retryCount} Retries</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-indigo-600 group-hover:underline flex items-center gap-1">
                        Inspect Trace
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
