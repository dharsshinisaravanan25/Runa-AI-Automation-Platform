import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import Layout from '../../components/AppShell/Layout';
import api from '../../services/api';
import {
  GitBranch,
  Plus,
  Sparkles,
  Search,
  Copy,
  Trash2,
  Play,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
  Tag,
  CheckCircle,
  ExternalLink,
  Zap,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedTag) params.tag = selectedTag;
      const res = await api.get('/workflows', { params });
      setWorkflows(res.data?.data?.workflows || []);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkflows();
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoading((p) => ({ ...p, [id]: 'cloning' }));
      const res = await api.post(`/workflows/${id}/duplicate`);
      if (res.data?.data?.workflow) {
        setWorkflows((prev) => [res.data.data.workflow, ...prev]);
      }
    } catch (err) {
      alert('Failed to clone workflow: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workflow and its logs?')) return;
    try {
      setActionLoading((p) => ({ ...p, [id]: 'deleting' }));
      await api.delete(`/workflows/${id}`);
      setWorkflows((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      alert('Failed to delete workflow: ' + err.message);
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handleExecute = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoading((p) => ({ ...p, [id]: 'running' }));
      const res = await api.post(`/workflows/${id}/execute`, { inputs: { initiatedBy: 'manual_list' } });
      const execution = res.data?.data?.execution;
      if (execution && execution._id) {
        router.push(`/executions/${execution._id}`);
      }
    } catch (err) {
      alert('Execution failed: ' + (err.response?.data?.error?.message || err.message));
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handleCreateManual = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'Omnichannel Social & Messaging Flow',
        description: 'Automate across WhatsApp, LinkedIn, Telegram & Gemini AI',
        nodes: [
          {
            id: 'node_1',
            type: 'custom',
            position: { x: 120, y: 200 },
            data: {
              label: 'Inbound Webhook Alert',
              category: 'trigger',
              icon: 'Zap',
              provider: 'webhook',
              action: 'receive_webhook',
              config: { endpoint: '/api/v1/trigger' }
            }
          },
          {
            id: 'node_2',
            type: 'custom',
            position: { x: 450, y: 200 },
            data: {
              label: 'Gemini AI Copywriter Agent',
              category: 'ai_agent',
              icon: 'Sparkles',
              provider: 'ai',
              action: 'ai_process',
              config: { prompt: 'Format updates for WhatsApp and LinkedIn' }
            }
          },
          {
            id: 'node_3',
            type: 'custom',
            position: { x: 780, y: 120 },
            data: {
              label: 'WhatsApp Direct Notification',
              category: 'messaging',
              icon: 'MessageCircle',
              provider: 'whatsapp',
              action: 'send_message',
              config: { to: '+1234567890', message: 'RUNA Alert: {{nodes.node_2.output}}' }
            }
          },
          {
            id: 'node_4',
            type: 'custom',
            position: { x: 780, y: 280 },
            data: {
              label: 'LinkedIn Thought Leadership',
              category: 'social',
              icon: 'Linkedin',
              provider: 'linkedin',
              action: 'create_post',
              config: { text: '{{nodes.node_2.output}}' }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true }
        ]
      });

      if (res.data?.data?.workflow) {
        router.push(`/workflows/${res.data.data.workflow._id}`);
      }
    } catch (err) {
      alert('Failed to create manual workflow: ' + err.message);
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
                Workflows Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visual DAG graphs orchestrated by cooperating AI swarms • <span className="italic">"You define it. We run it."</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/workflows/builder')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-100 transition hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt Builder</span>
              </button>

              <button
                onClick={handleCreateManual}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 shadow-soft-sm transition"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>New Omnichannel Flow</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-soft-sm">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search WhatsApp, LinkedIn, Sheets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </form>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['', 'WhatsApp', 'Telegram', 'LinkedIn', 'Instagram', 'Sheets', 'Gmail', 'Slack'].map((tag) => (
                <button
                  key={tag || 'all'}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedTag === tag
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {tag ? tag : 'All Workflows'}
                </button>
              ))}
            </div>
          </div>

          {/* Workflows Grid */}
          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
              <p className="text-xs">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white border border-slate-200 shadow-soft-sm">
              <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No workflows found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Synthesize a workflow from the AI Studio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => {
                const isLoadingAction = actionLoading[wf._id];

                return (
                  <div
                    key={wf._id}
                    onClick={() => router.push(`/workflows/${wf._id}`)}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-soft-sm hover:shadow-soft-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          v{wf.version || 1}
                        </span>
                        <span className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
                          wf.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {wf.status || 'draft'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                        {wf.name}
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {wf.description || 'Custom multi-agent DAG pipeline configured in RUNA.'}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(wf.tags || []).map((t, idx) => (
                          <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-400 font-medium">
                        {(wf.nodes || []).length} Nodes • {(wf.edges || []).length} Edges
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Execute Button */}
                        <button
                          type="button"
                          title="Execute Swarm"
                          onClick={(e) => handleExecute(wf._id, e)}
                          disabled={Boolean(isLoadingAction)}
                          className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition border border-indigo-100 shadow-soft-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          type="button"
                          title="Duplicate Workflow"
                          onClick={(e) => handleDuplicate(wf._id, e)}
                          disabled={Boolean(isLoadingAction)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          title="Delete Workflow"
                          onClick={(e) => handleDelete(wf._id, e)}
                          disabled={Boolean(isLoadingAction)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
