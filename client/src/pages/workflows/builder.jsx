import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import Layout from '../../components/AppShell/Layout';
import api from '../../services/api';
import {
  Sparkles,
  ArrowRight,
  Terminal,
  Layers,
  Zap,
  Play,
  Save,
  CheckCircle2,
  Loader2,
  Cpu,
  Radio
} from 'lucide-react';

const PROMPT_RECIPES = [
  {
    title: 'Gmail Invoice Triage to Sheets & Slack',
    tag: 'Finance',
    prompt: 'Ingest unread billing emails from Gmail, parse invoice totals & vendor names with AI extraction agent, record rows in Google Sheets, and notify #finance channel on Slack.'
  },
  {
    title: 'Customer Sentiment Escalation & Discord',
    tag: 'Support',
    prompt: 'Listen to incoming customer support tickets via Webhook, analyze sentiment score and frustration level using AI Agent, and immediately escalate critical issues to Discord with high priority.'
  },
  {
    title: 'Executive Daily Operations Digest',
    tag: 'Digest',
    prompt: 'Every morning at 9 AM, fetch important unread messages from Gmail, generate an executive bullet-point summary with AI agent, and dispatch morning brief to Slack.'
  },
  {
    title: 'Security Incident War Room Alert',
    tag: 'Incident',
    prompt: 'Ingest urgent server error alerts, analyze root cause impact across infrastructure with AI Agent, post incident brief to Slack war room, and append timestamped log to Google Sheets.'
  }
];

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (router.query.prompt) {
      setPrompt(decodeURIComponent(router.query.prompt));
    }
  }, [router.query]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setError('');
    setIsGenerating(true);

    try {
      const res = await api.post('/workflows/generate', { prompt: prompt.trim() });
      if (res.data?.data?.workflow) {
        setGeneratedWorkflow(res.data.data.workflow);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Workflow synthesis failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndOpen = async () => {
    if (!generatedWorkflow) return;
    setIsSaving(true);

    try {
      const res = await api.post('/workflows', {
        name: generatedWorkflow.name,
        description: generatedWorkflow.description,
        status: 'active',
        triggerConfig: generatedWorkflow.triggerConfig || { type: 'manual' },
        nodes: generatedWorkflow.nodes,
        edges: generatedWorkflow.edges,
        tags: generatedWorkflow.tags || ['Agentra', 'Synthesized']
      });

      const newWf = res.data?.data?.workflow;
      if (newWf && newWf._id) {
        router.push(`/workflows/${newWf._id}`);
      }
    } catch (err) {
      alert('Failed to save workflow: ' + (err.response?.data?.error?.message || err.message));
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Workflow Synthesizer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                AI Workflow Studio
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Compile natural language into an executable multi-agent DAG workflow
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Prompt Input Panel */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Prompt Specification</span>
                </div>

                <form onSubmit={handleGenerate} className="space-y-3">
                  <textarea
                    rows={5}
                    placeholder="Describe your desired automation flow in detail..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 leading-relaxed resize-none transition shadow-soft-sm"
                  />

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-100 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Synthesizing Workflow...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Workflow Graph</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Recipe Suggestions */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Inspiration Recipes
                </h3>
                <div className="space-y-2.5">
                  {PROMPT_RECIPES.map((recipe, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPrompt(recipe.prompt)}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {recipe.title}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {recipe.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {recipe.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Graph Preview Panel */}
            <div className="lg:col-span-7">
              <div className="h-full min-h-[520px] rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-soft-sm relative overflow-hidden">
                {generatedWorkflow ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Metadata */}
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Generated Successfully
                            </span>
                            <span className="text-xs text-slate-500">
                              {generatedWorkflow.nodes?.length || 0} Nodes • {generatedWorkflow.edges?.length || 0} Edges
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">
                            {generatedWorkflow.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {generatedWorkflow.description}
                          </p>
                        </div>
                      </div>

                      {/* Step-by-Step Preview */}
                      <div className="mt-6 space-y-3">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Pipeline Steps
                        </h4>

                        <div className="space-y-2.5">
                          {generatedWorkflow.nodes?.map((node, i) => (
                            <div
                              key={node.id}
                              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 shadow-soft-sm flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-900">
                                    {node.data?.label || node.id}
                                  </div>
                                  <div className="text-[11px] text-slate-500 capitalize">
                                    {node.data?.provider} • {node.data?.action}
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                                {node.data?.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                      <button
                        onClick={handleSaveAndOpen}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-100 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Open & Edit on Visual Canvas</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-soft-sm">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      AI Workflow Graph Compiler
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Enter a prompt on the left or select an inspiration recipe to compile your visual multi-agent workflow.
                    </p>
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
