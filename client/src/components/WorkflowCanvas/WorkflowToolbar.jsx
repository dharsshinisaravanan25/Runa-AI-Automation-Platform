import React from 'react';
import {
  Save,
  Play,
  Share2,
  Trash2,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/router';

export default function WorkflowToolbar({
  workflowName,
  onNameChange,
  onSave,
  onExecute,
  isSaving,
  isExecuting,
  nodeCount = 0
}) {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none font-sans">
      {/* Left Back & Name Editor */}
      <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-2xl shadow-soft-md pointer-events-auto w-full sm:w-auto">
        <button
          onClick={() => router.push('/workflows')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          title="Back to workflows"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent font-bold text-sm text-slate-900 focus:outline-none focus:bg-slate-50 px-2 py-1 rounded-lg transition min-w-[200px]"
            placeholder="Workflow Name..."
          />
        </div>

        <div className="text-xs text-slate-500 font-medium px-2 hidden sm:block">
          {nodeCount} Nodes
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-2xl shadow-soft-md pointer-events-auto">
        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save</span>
        </button>

        {/* Execute Swarm Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isExecuting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>Execute Swarm</span>
        </button>
      </div>
    </div>
  );
}
