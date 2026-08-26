import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Mail,
  MessageSquare,
  Bot,
  Table,
  Sparkles,
  Cpu,
  Filter,
  Zap,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  ChevronRight,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Facebook,
  Share2
} from 'lucide-react';

const ICON_MAP = {
  Mail,
  MessageSquare,
  Bot,
  Table,
  Sparkles,
  Cpu,
  Filter,
  Zap,
  Globe,
  Clock,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Facebook,
  Share2
};

const CATEGORY_COLORS = {
  trigger: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-l-4 border-l-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600'
  },
  ai_agent: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    border: 'border-l-4 border-l-indigo-500',
    iconBg: 'bg-indigo-50 text-indigo-600'
  },
  social: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    border: 'border-l-4 border-l-sky-500',
    iconBg: 'bg-sky-50 text-sky-600'
  },
  messaging: {
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    border: 'border-l-4 border-l-teal-500',
    iconBg: 'bg-teal-50 text-teal-600'
  },
  integration: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    border: 'border-l-4 border-l-purple-500',
    iconBg: 'bg-purple-50 text-purple-600'
  },
  logic: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-l-4 border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-600'
  }
};

const CustomNode = ({ data, selected }) => {
  const Icon = ICON_MAP[data?.icon] || Zap;
  const categoryStyle = CATEGORY_COLORS[data?.category] || CATEGORY_COLORS.integration;

  const status = data?.executionStatus; // 'IDLE', 'RUNNING', 'COMPLETED', 'FAILED'

  let statusRing = '';
  if (status === 'RUNNING') {
    statusRing = 'ring-2 ring-indigo-500 shadow-md shadow-indigo-100';
  } else if (status === 'COMPLETED') {
    statusRing = 'ring-2 ring-emerald-500 shadow-md shadow-emerald-100';
  } else if (status === 'FAILED') {
    statusRing = 'ring-2 ring-rose-500 shadow-md shadow-rose-100';
  } else if (selected) {
    statusRing = 'ring-2 ring-indigo-400 shadow-soft-md';
  }

  return (
    <div
      className={`w-64 rounded-2xl bg-white border border-slate-200 shadow-soft-md ${categoryStyle.border} ${statusRing} transition-all duration-200 font-sans select-none relative`}
    >
      {/* Incoming Node Port (Target) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white !rounded-full -left-1.5 transition hover:!bg-indigo-600 hover:scale-125"
      />

      <div className="p-3.5 space-y-2">
        {/* Top Meta Line */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${categoryStyle.badge}`}>
            {data?.category || 'NODE'}
          </span>

          {status === 'RUNNING' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 animate-pulse">
              <Activity className="w-3 h-3 animate-spin" />
              Running
            </span>
          )}
          {status === 'COMPLETED' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Completed
            </span>
          )}
          {status === 'FAILED' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              Failed
            </span>
          )}
        </div>

        {/* Node Name & Provider */}
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border border-slate-100 ${categoryStyle.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {data?.label || 'Step Action'}
            </h4>
            <p className="text-[11px] text-slate-500 truncate capitalize">
              {data?.provider || 'core'} • {data?.action || 'execute'}
            </p>
          </div>
        </div>

        {/* Config Summary */}
        {data?.config && Object.keys(data.config).length > 0 && (
          <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {data.config.to || data.config.chatId || data.config.caption || data.config.channel || data.config.query || data.config.endpoint || data.config.prompt || 'Configured'}
          </div>
        )}
      </div>

      {/* Outgoing Node Port (Source) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-600 !border-2 !border-white !rounded-full -right-1.5 transition hover:scale-125 shadow-xs"
      />
    </div>
  );
};

export default memo(CustomNode);
