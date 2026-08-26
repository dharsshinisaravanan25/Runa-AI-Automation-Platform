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
  ChevronRight,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Facebook,
  Table,
  Mail,
  Share2
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const swarmAgents = [
    { name: 'Planner Agent', role: 'Topological DAG Architect', metric: '99.4% Acc.', desc: 'Compiles natural language into an acyclic graph with smart step ordering and data validation.' },
    { name: 'Execution Agent', role: 'Omnichannel API Dispatcher', metric: '50+ Actions', desc: 'Dispatches live actions across WhatsApp, Telegram, LinkedIn, Instagram, Facebook, and Gmail.' },
    { name: 'Validation Agent', role: 'Strict Schema Guard', metric: 'Zero-Leak', desc: 'Ensures payload integrity, data cleanliness, and strict typing across inter-agent memory.' },
    { name: 'Recovery Agent', role: 'Autonomous Self-Healing', metric: 'Auto-Backoff', desc: 'Classifies failure taxonomy, computes jittered exponential backoff, and heals transient issues.' },
    { name: 'Monitoring Agent', role: 'Real-Time Socket Stream', metric: '<3ms Latency', desc: 'Streams granular live execution events over WebSockets and logs complete audit snapshots.' }
  ];

  const channelSimulations = {
    whatsapp: {
      title: 'WhatsApp Business Cloud Alert',
      icon: MessageCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'Delivered (E.164)',
      preview: '🚨 *RUNA ALERT*: High-value enterprise lead registered via Facebook Ads. AI Agent classified intent score as 96/100. Follow-up dispatched to executive team.'
    },
    telegram: {
      title: 'Telegram War Room Broadcast',
      icon: Send,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      badge: 'Group Broadcast',
      preview: '⚡ *Incident Auto-Resolved*: Server CPU spike normalized. Gemini Agent analyzed root cause: heavy batch report. Cache evicted successfully.'
    },
    linkedin: {
      title: 'LinkedIn Thought Leadership Post',
      icon: Linkedin,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      badge: 'Published Live',
      preview: '💡 How we automated our customer operations using RUNA AI Swarms without writing a single line of webhook boilerplate. Read the full architectural breakdown below 🚀 #AI #Ops'
    },
    instagram: {
      title: 'Instagram Carousel & Reel Caption',
      icon: Instagram,
      color: 'bg-pink-50 text-pink-600 border-pink-200',
      badge: 'Published Media',
      preview: '✨ The future of autonomous agentic operations is here. You define it. We run it. ⚡ #RUNA #AIWorkflows #TechInnovation'
    },
    sheets: {
      title: 'Google Sheets Audit Ledger',
      icon: Table,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      badge: 'Appended Row #1,402',
      preview: '2026-08-26T15:00:00Z | Lead #892 | Intent: High | Action: Auto-Dispatched | Status: SUCCESS'
    }
  };

  const activeSim = channelSimulations[selectedChannel];
  const SimIcon = activeSim.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 overflow-x-hidden font-sans">
      {/* Clean Navbar */}
      <header className="relative z-30 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">RUNA</span>
              <span className="text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                v3.0 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">You define it. We run it.</p>
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
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-6 shadow-soft-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span>RUNA // Autonomous Agentic AI Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
          You define it. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            We run it.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From **WhatsApp, Telegram & LinkedIn** to **Instagram, Google Sheets & Gmail** — describe your desired business automation in natural language. <strong className="text-slate-900 font-semibold">RUNA</strong> synthesizes the DAG graph and coordinates 5 cooperating AI agents to run it autonomously.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>1-Click Operator Login</span>
          </button>
          <button
            onClick={() => router.push('/workflows/builder')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-soft-sm transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Try AI Prompt Studio</span>
          </button>
        </div>

        {/* Real-Life Omnichannel Interactive Swarm Simulator */}
        <div className="mt-14 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xl p-6 sm:p-8 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Real-Life Omnichannel Swarm HUD</h3>
                <p className="text-xs text-slate-400">Live multi-platform execution simulator</p>
              </div>
            </div>

            {/* Channel Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                { id: 'telegram', label: 'Telegram', icon: Send },
                { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                { id: 'instagram', label: 'Instagram', icon: Instagram },
                { id: 'sheets', label: 'Google Sheets', icon: Table }
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedChannel === ch.id
                        ? 'bg-indigo-600 text-white shadow-soft-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Simulator Preview Bubble */}
          <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${activeSim.color}`}>
                  <SimIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">{activeSim.title}</span>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeSim.badge}
              </span>
            </div>

            <p className="text-xs font-mono text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-soft-sm">
              {activeSim.preview}
            </p>
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
        </div>
      </section>

      {/* Real-Life Node Matrix */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-200/80">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Real-Life Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Connect Everywhere Your Business Operates
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Zero-code orchestration across messaging apps, social networks, databases, and AI models
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'WhatsApp Business', desc: 'Direct alerts & customer support', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { name: 'Telegram Bots', desc: 'Incident rooms & broadcasts', icon: Send, color: 'text-sky-600 bg-sky-50 border-sky-100' },
            { name: 'LinkedIn Marketing', desc: 'Thought leadership & InMail', icon: Linkedin, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { name: 'Instagram & Reels', desc: 'Captions & smart DM replies', icon: Instagram, color: 'text-pink-600 bg-pink-50 border-pink-100' },
            { name: 'Facebook Pages', desc: 'Page posts & Lead Ads', icon: Facebook, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { name: 'Google Gemini 2.5', desc: 'Multimodal AI reasoning', icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { name: 'Google Sheets DB', desc: 'Persistent audit ledgers', icon: Table, color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { name: 'Slack & Discord', desc: 'Team war rooms & alerts', icon: Mail, color: 'text-amber-600 bg-amber-50 border-amber-100' }
          ].map((app, i) => {
            const AppIcon = app.icon;
            return (
              <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm space-y-2 hover:border-indigo-300 transition group">
                <div className={`p-2.5 rounded-xl border w-fit ${app.color} group-hover:scale-105 transition-transform`}>
                  <AppIcon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{app.name}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{app.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2 font-medium">
          <span className="font-extrabold text-slate-900">RUNA</span>
          <span>•</span>
          <span className="italic">You define it. We run it.</span>
        </div>
        <div>Autonomous Agentic AI Operations Platform</div>
      </footer>
    </div>
  );
}
