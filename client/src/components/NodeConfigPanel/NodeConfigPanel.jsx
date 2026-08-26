import React from 'react';
import {
  X,
  Trash2,
  Settings,
  HelpCircle,
  Code2,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function NodeConfigPanel({ node, onClose, onUpdate, onDelete }) {
  if (!node) return null;

  const data = node.data || {};
  const config = data.config || {};

  const handleFieldChange = (key, value) => {
    onUpdate(node.id, {
      ...data,
      config: {
        ...config,
        [key]: value
      }
    });
  };

  const handleLabelChange = (newLabel) => {
    onUpdate(node.id, {
      ...data,
      label: newLabel
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 select-none z-20 font-sans shadow-soft-md">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Node Properties</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(node.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Fields */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        {/* Node Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Step Title
          </label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
          />
        </div>

        {/* Dynamic Config Fields */}
        {data.provider === 'webhook' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Endpoint Path</label>
            <input
              type="text"
              value={config.endpoint || '/api/v1/trigger'}
              onChange={(e) => handleFieldChange('endpoint', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
            />
          </div>
        )}

        {data.provider === 'gmail' && data.action === 'read_inbox' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Search Query / Filter</label>
            <input
              type="text"
              value={config.query || 'is:unread'}
              onChange={(e) => handleFieldChange('query', e.target.value)}
              placeholder="e.g. is:unread label:important"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
            />
          </div>
        )}

        {data.provider === 'ai' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">AI Prompt & Instructions</label>
            <textarea
              rows={4}
              value={config.prompt || ''}
              onChange={(e) => handleFieldChange('prompt', e.target.value)}
              placeholder="e.g. Extract key entities from input text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition leading-relaxed resize-none"
            />
          </div>
        )}

        {data.provider === 'slack' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slack Channel</label>
              <input
                type="text"
                value={config.channel || '#general'}
                onChange={(e) => handleFieldChange('channel', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
              <textarea
                rows={3}
                value={config.message || ''}
                onChange={(e) => handleFieldChange('message', e.target.value)}
                placeholder="Supports {{nodes.<id>.output}} interpolation"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition leading-relaxed resize-none"
              />
            </div>
          </>
        )}

        {data.provider === 'google-sheets' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Spreadsheet ID</label>
              <input
                type="text"
                value={config.spreadsheetId || ''}
                onChange={(e) => handleFieldChange('spreadsheetId', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sheet Range</label>
              <input
                type="text"
                value={config.range || 'Sheet1!A:E'}
                onChange={(e) => handleFieldChange('range', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
              />
            </div>
          </>
        )}

        {/* Dynamic Variable Hint */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dynamic Interpolation</span>
          </div>
          <p className="text-[11px] text-indigo-800 leading-snug">
            Reference previous step outputs with: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px] text-indigo-900 border border-indigo-200">{'{{nodes.<id>.output}}'}</code>
          </p>
        </div>
      </div>
    </aside>
  );
}
