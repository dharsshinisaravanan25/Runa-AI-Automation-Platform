import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import Layout from '../../components/AppShell/Layout';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  Activity,
  Play,
  Pause,
  StopCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Terminal,
  ArrowLeft,
  ChevronRight,
  Code2
} from 'lucide-react';

export default function ExecutionTracePage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [controlLoading, setControlLoading] = useState(false);

  const logsEndRef = useRef(null);

  const fetchExecutionData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [execRes, timelineRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`)
      ]);

      if (execRes.data?.data?.execution) {
        setExecution(execRes.data.data.execution);
      }
      if (timelineRes.data?.data?.timeline) {
        setLogs(timelineRes.data.data.timeline);
      }
    } catch (err) {
      console.error('Failed to fetch execution details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    fetchExecutionData();
    joinExecutionRoom(id);

    const socket = getSocket();
    if (!socket) return;

    const handleAgentEvent = (eventLog) => {
      setLogs((prev) => {
        const exists = prev.some((l) => (l._id || l.id) === (eventLog._id || eventLog.id));
        if (exists) return prev;
        return [...prev, eventLog];
      });
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    const handleExecutionUpdate = (updatedExec) => {
      setExecution((prev) => ({ ...prev, ...updatedExec }));
    };

    socket.on('agent:event', handleAgentEvent);
    socket.on('execution:update', handleExecutionUpdate);

    return () => {
      leaveExecutionRoom(id);
      socket.off('agent:event', handleAgentEvent);
      socket.off('execution:update', handleExecutionUpdate);
    };
  }, [id]);

  const handlePause = async () => {
    if (!id) return;
    try {
      setControlLoading(true);
      await api.post(`/executions/${id}/pause`);
      setExecution((prev) => ({ ...prev, status: 'PAUSED' }));
    } catch (err) {
      alert('Pause failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setControlLoading(false);
    }
  };

  const handleResume = async () => {
    if (!id) return;
    try {
      setControlLoading(true);
      await api.post(`/executions/${id}/resume`);
      setExecution((prev) => ({ ...prev, status: 'RUNNING' }));
    } catch (err) {
      alert('Resume failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setControlLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Cancel this running execution?')) return;
    try {
      setControlLoading(true);
      await api.post(`/executions/${id}/cancel`);
      setExecution((prev) => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      alert('Cancel failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setControlLoading(false);
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Planner
          </span>
        );
      case 'execution':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Execution
          </span>
        );
      case 'validation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Validation
          </span>
        );
      case 'recovery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Recovery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Monitoring
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => router.push('/executions')}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-soft-sm"
                title="Back to executions"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {execution?.workflowSnapshot?.name || 'Workflow Execution Trace'}
                  </h2>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ID: {id?.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {execution?.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'Streaming in-flight'}
                  </span>
                  <span>•</span>
                  <span>
                    Started {execution?.startTime ? new Date(execution.startTime).toLocaleTimeString() : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={controlLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs border border-amber-200 transition"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={controlLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )}

              {(execution?.status === 'RUNNING' || execution?.status === 'PAUSED') && (
                <button
                  onClick={handleCancel}
                  disabled={controlLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}

              <button
                onClick={fetchExecutionData}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-soft-sm"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Stepper Node Tracker */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pipeline Progress Steps
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-slate-500">Status:</span>
                <span className="text-indigo-600 uppercase">
                  {execution?.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
              {(execution?.workflowSnapshot?.nodes || []).map((node, idx) => {
                const isCurrent = execution?.currentNode === node.id;
                const isCompleted = execution?.outputs && execution.outputs[node.id];
                const isFailed = execution?.status === 'FAILED' && execution.error?.failedNodeId === node.id;

                let border = 'border-slate-200 bg-slate-50/60';
                if (isCurrent) border = 'border-indigo-500 bg-indigo-50/70 shadow-soft-sm ring-1 ring-indigo-400';
                if (isCompleted) border = 'border-emerald-300 bg-emerald-50/50';
                if (isFailed) border = 'border-rose-300 bg-rose-50/50';

                return (
                  <div key={node.id} className={`p-4 rounded-2xl border ${border} transition-all`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-500">STEP {idx + 1}</span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isCurrent && <Activity className="w-4 h-4 text-indigo-600 animate-spin" />}
                      {isFailed && <AlertCircle className="w-4 h-4 text-rose-600" />}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {node.data?.label || node.id}
                    </h4>
                    <p className="text-[11px] text-slate-500 capitalize mt-0.5 truncate">
                      {node.data?.provider} • {node.data?.action}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trace Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
            {[
              { id: 'timeline', label: `Agent Event Timeline (${logs.length})`, icon: Activity },
              { id: 'outputs', label: 'Runtime Outputs & Memory', icon: Layers },
              { id: 'raw', label: 'Raw Execution JSON', icon: Code2 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-soft-sm min-h-[420px]">
            {/* 1. Timeline View */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No agent events recorded yet. Listening to real-time socket room...
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    {logs.map((log, idx) => (
                      <div
                        key={log._id || log.id || idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          log.level === 'error'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                            : log.level === 'warning'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : log.level === 'success'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50/60 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {getAgentBadge(log.agent)}
                            {log.nodeId && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                                Node: {log.nodeId}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-800">
                          {log.message}
                        </p>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            )}

            {/* 2. Step Outputs View */}
            {activeTab === 'outputs' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Step Output Memory
                </h3>
                {execution?.outputs && Object.keys(execution.outputs).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(execution.outputs).map(([nodeId, nodeRes]) => (
                      <div key={nodeId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                          <span className="text-xs font-bold text-indigo-700 font-mono">{nodeId}</span>
                          <span className="text-xs text-slate-500">
                            Latency: {nodeRes.durationMs ? `${nodeRes.durationMs}ms` : 'N/A'}
                          </span>
                        </div>
                        <pre className="text-xs font-mono text-slate-800 bg-white p-3 rounded-xl overflow-x-auto border border-slate-200">
                          {JSON.stringify(nodeRes.output || nodeRes, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No output memory captured yet.
                  </div>
                )}
              </div>
            )}

            {/* 3. Raw JSON */}
            {activeTab === 'raw' && (
              <div>
                <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-4 rounded-2xl overflow-x-auto border border-slate-200">
                  {JSON.stringify(execution, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
