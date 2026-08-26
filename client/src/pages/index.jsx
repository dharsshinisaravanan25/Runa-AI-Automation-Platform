import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Terminal,
  Play,
  CheckCircle2,
  GitBranch,
  Layers,
  Cpu,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const swarmAgents = [
    { name: 'Planner Agent', role: 'DAG Topology & Ordering', metric: '99.2% Acc.', desc: 'Compiles natural language into an acyclic topological dependency graph with branching validation.' },
    { name: 'Execution Agent', role: 'Dynamic Variable Interpolation', metric: '40+ Actions', desc: 'Injects live variables and dispatches authenticated payloads across OAuth endpoints and AI models.' },
    { name: 'Validation Agent', role: 'Schema Integrity Guard', metric: 'Zero-Leak', desc: 'Validates strict output typing, required parameter completeness, and payload cleanliness.' },
    { name: 'Recovery Agent', role: 'Self-Healing & Backoff', metric: 'Auto-Retry', desc: 'Classifies failure taxonomy, computes jittered exponential backoff, or escalates with remedy actions.' },
    { name: 'Monitoring Agent', role: 'Real-Time Telemetry Stream', metric: '<5ms Ping', desc: 'Emits granular timeline logs over Socket.IO and persists full operational audit snapshots.' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 overflow-x-hidden font-sans">
      {/* Clean Navbar */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Agentra</span>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Autonomous Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/register')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition hover:scale-105 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-soft-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span>Agentic AI Automation Platform • Online</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Build Autonomous AI Workflows <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            From Plain Natural Language
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Describe any business process in plain English. <strong className="text-slate-900 font-semibold">Agentra</strong> automatically compiles interactive visual DAG graphs, coordinates a cooperating 5-agent swarm, connects to your apps over OAuth, and recovers autonomously.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Try 1-Click Demo Login</span>
          </button>
          <button
            onClick={() => router.push('/workflows/builder')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-soft-sm transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Prompt Studio</span>
          </button>
        </div>

        {/* Interactive Swarm Preview Card */}
        <div className="mt-14 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xl p-6 sm:p-8 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Agentra Cooperating Swarm Pipeline
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Agent Swarm Ready</span>
            </div>
          </div>

          {/* 5-Agent Interactive Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {swarmAgents.map((agent, i) => (
              <div
                key={i}
                onClick={() => setActiveTab(i)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === i
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-soft-sm ring-1 ring-indigo-300'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{agent.name}</div>
                <div className="text-[11px] font-semibold text-indigo-600 mt-0.5">{agent.metric}</div>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{agent.desc}</p>
              </div>
            ))}
          </div>

          {/* Prompt Example Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-white text-indigo-600 border border-slate-200 shadow-soft-sm shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-700 font-medium truncate">
                "Parse Stripe customer invoices, summarize risk score via AI, write audit row to Google Sheets, and alert Slack"
              </p>
            </div>

            <button
              onClick={() => router.push('/workflows/builder')}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-soft-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Flow</span>
            </button>
          </div>
        </div>
      </section>

      {/* Clean Feature Pillars */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/80">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Engineered for Reliable Autonomous Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm space-y-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 w-fit">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Visual Flow Canvas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drag-and-drop React Flow canvas with real-time step status indicators, property inspection, and execution controls.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm space-y-3">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AES-256 Encrypted Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OAuth credentials for Gmail, Slack, Discord, and Google Sheets are encrypted at rest with zero exposure in execution logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm space-y-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Self-Healing Swarms</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated failure classification with exponential backoff retries and graceful escalation for enterprise-grade reliability.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-bold text-slate-900">Agentra</span>
          <span>•</span>
          <span>Autonomous Agentic AI Operations Platform</span>
        </div>
        <div>Built for high-reliability agentic automation.</div>
      </footer>
    </div>
  );
}
