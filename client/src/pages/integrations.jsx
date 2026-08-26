import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Layout from '../components/AppShell/Layout';
import api from '../services/api';
import {
  Puzzle,
  Mail,
  MessageSquare,
  Bot,
  Table,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  Key,
  Radio,
  Loader2,
  RefreshCw
} from 'lucide-react';

const INTEGRATION_DEFINITIONS = [
  {
    id: 'gmail',
    name: 'Gmail API Vault',
    icon: Mail,
    category: 'Communication',
    description: 'Read inbound emails, parse customer messages, and dispatch outbound HTML messages.',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
    hasOAuth: true
  },
  {
    id: 'slack',
    name: 'Slack Bot Workspace',
    icon: MessageSquare,
    category: 'Team Collaboration',
    description: 'Post automated channel alerts, interactive messages, and listen to team channel activity.',
    scopes: ['chat:write', 'channels:read', 'incoming-webhook'],
    hasOAuth: true
  },
  {
    id: 'discord',
    name: 'Discord Webhook & Bot',
    icon: Bot,
    category: 'Operations & Alerts',
    description: 'Trigger instant channel broadcasts, rich embeds, and incident war room notifications.',
    scopes: ['bot', 'webhook.incoming'],
    hasOAuth: false
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets DB',
    icon: Table,
    category: 'Data Persistence',
    description: 'Append real-time audit rows, update operational ranges, and read customer registries.',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    hasOAuth: true
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Multi-LLM',
    icon: Sparkles,
    category: 'AI Model Fabric',
    description: 'Access Claude 3.5 Sonnet, Llama 3.3 70B, and DeepSeek via unified API key.',
    scopes: ['api_key'],
    hasOAuth: false
  },
  {
    id: 'gemini',
    name: 'Google Gemini SDK',
    icon: Sparkles,
    category: 'AI Multimodal',
    description: 'High-speed reasoning, vision analysis, and structured extraction with Gemini 1.5 Pro/Flash.',
    scopes: ['gemini_api_key'],
    hasOAuth: false
  }
];

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalProvider, setModalProvider] = useState(null);
  const [manualCredentials, setManualCredentials] = useState({});
  const [savingKey, setSavingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/integrations/status');
      if (res.data?.data?.statuses) {
        setStatuses(res.data.data.statuses);
      }
    } catch (err) {
      console.error('Failed to load integration statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleOAuthConnect = async (providerId) => {
    try {
      const res = await api.get(`/integrations/oauth/${providerId}/start`);
      if (res.data?.data?.authUrl) {
        window.location.href = res.data.data.authUrl;
      }
    } catch (err) {
      alert('OAuth initialization error: ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!modalProvider) return;

    try {
      setSavingKey(true);
      await api.post('/integrations', {
        provider: modalProvider.id,
        credentials: manualCredentials
      });
      alert(`Encrypted credentials for ${modalProvider.name} stored in AES-256 vault.`);
      setModalProvider(null);
      setManualCredentials({});
      fetchStatuses();
    } catch (err) {
      alert('Failed to save credentials: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSavingKey(false);
    }
  };

  const handleTestConnection = async (providerId) => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.post(`/integrations/test/${providerId}`);
      setTestResult({ provider: providerId, ...res.data?.data });
    } catch (err) {
      setTestResult({
        provider: providerId,
        success: false,
        message: err.response?.data?.error?.message || err.message
      });
    } finally {
      setTesting(false);
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
                Integrations Vault
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Connect external apps and AI providers with AES-256-GCM token encryption
              </p>
            </div>

            {/* Cryptographic Health Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-soft-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AES-256 Encryption Active</span>
            </div>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-soft-sm ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>[{testResult.provider?.toUpperCase()}]: {testResult.message}</span>
              </div>
              <button onClick={() => setTestResult(null)} className="text-slate-500 hover:text-slate-900 font-bold">Dismiss</button>
            </div>
          )}

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_DEFINITIONS.map((item) => {
              const Icon = item.icon;
              const statusInfo = statuses[item.id] || { isConnected: false, status: 'DISCONNECTED' };
              const isConnected = statusInfo.isConnected;

              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all duration-200 shadow-soft-sm hover:shadow-soft-md flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Status */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{item.name}</h3>
                          <span className="text-[11px] text-slate-400">{item.category}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>

                    {statusInfo.accountEmail && (
                      <div className="mt-3 text-[11px] text-slate-700 font-mono bg-slate-50 p-2 rounded-xl border border-slate-200 truncate">
                        Account: {statusInfo.accountEmail}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTestConnection(item.id)}
                      disabled={testing}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                      <span>Test</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {item.hasOAuth && (
                        <button
                          onClick={() => handleOAuthConnect(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold text-xs transition border border-indigo-100 shadow-soft-sm"
                        >
                          Connect OAuth
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setModalProvider(item);
                          setManualCredentials({});
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition shadow-soft-sm"
                      >
                        Set API Key
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Credential Modal */}
          {modalProvider && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-soft-xl p-6 sm:p-8 space-y-4 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{modalProvider.name}</h3>
                      <p className="text-[11px] text-slate-400">Save encrypted credentials to AES-256 vault</p>
                    </div>
                  </div>
                  <button onClick={() => setModalProvider(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>

                <form onSubmit={handleSaveManual} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">API Key / Access Token</label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. sk-live-..., xoxb-..., or webhook URL"
                      value={manualCredentials.accessToken || manualCredentials.apiKey || manualCredentials.webhookUrl || ''}
                      onChange={(e) => setManualCredentials({ ...manualCredentials, accessToken: e.target.value, apiKey: e.target.value, webhookUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Account Identifier / Email</label>
                    <input
                      type="text"
                      placeholder="e.g. integration@company.com"
                      value={manualCredentials.accountEmail || ''}
                      onChange={(e) => setManualCredentials({ ...manualCredentials, accountEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalProvider(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingKey}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-100"
                    >
                      {savingKey ? 'Encrypting...' : 'Save Credentials'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
