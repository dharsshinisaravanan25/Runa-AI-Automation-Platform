import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Bot,
  Table,
  Sparkles,
  Cpu,
  Filter,
  Zap,
  Clock,
  Search,
  ChevronDown,
  Layers
} from 'lucide-react';

const PALETTE_CATEGORIES = [
  {
    id: 'triggers',
    name: 'Triggers',
    items: [
      {
        type: 'custom',
        category: 'trigger',
        label: 'Webhook Trigger',
        provider: 'webhook',
        action: 'receive_webhook',
        icon: 'Zap',
        desc: 'Listen for inbound JSON webhooks',
        defaultConfig: { endpoint: '/api/v1/trigger' }
      },
      {
        type: 'custom',
        category: 'trigger',
        label: 'Gmail Inbound Filter',
        provider: 'gmail',
        action: 'read_inbox',
        icon: 'Mail',
        desc: 'Trigger on incoming unread emails',
        defaultConfig: { query: 'is:unread', maxResults: 5 }
      },
      {
        type: 'custom',
        category: 'trigger',
        label: 'Schedule Cron',
        provider: 'schedule',
        action: 'cron_trigger',
        icon: 'Clock',
        desc: 'Trigger on automated timer schedule',
        defaultConfig: { cron: '0 9 * * 1-5' }
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI Swarm Agents',
    items: [
      {
        type: 'custom',
        category: 'ai_agent',
        label: 'AI Reasoning Agent',
        provider: 'ai',
        action: 'ai_process',
        icon: 'Sparkles',
        desc: 'Analyze, extract, and reason with LLMs',
        defaultConfig: { prompt: 'Extract key actionable items from data', model: 'auto' }
      },
      {
        type: 'custom',
        category: 'ai_agent',
        label: 'Sentiment & Intent Classifier',
        provider: 'ai',
        action: 'sentiment_analysis',
        icon: 'Cpu',
        desc: 'Classify tone, sentiment, and urgency',
        defaultConfig: { prompt: 'Classify sentiment from 0.0 to 1.0' }
      },
      {
        type: 'custom',
        category: 'ai_agent',
        label: 'Executive Summarizer',
        provider: 'ai',
        action: 'summarize',
        icon: 'Sparkles',
        desc: 'Formulate concise bullet-point digests',
        defaultConfig: { prompt: 'Summarize top 3 points with action items' }
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Apps & Integrations',
    items: [
      {
        type: 'custom',
        category: 'integration',
        label: 'Slack Message Dispatch',
        provider: 'slack',
        action: 'post_message',
        icon: 'MessageSquare',
        desc: 'Post rich messages to Slack channels',
        defaultConfig: { channel: '#general', message: 'Automation update: {{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'integration',
        label: 'Discord Channel Alert',
        provider: 'discord',
        action: 'post_message',
        icon: 'Bot',
        desc: 'Broadcast embeds to Discord',
        defaultConfig: { channelId: 'alerts', message: 'Incident: {{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'integration',
        label: 'Google Sheets Record',
        provider: 'google-sheets',
        action: 'append_row',
        icon: 'Table',
        desc: 'Append audit rows to Google Sheets',
        defaultConfig: { spreadsheetId: '1SheetId', range: 'Sheet1!A:E', values: '{{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'integration',
        label: 'Gmail Send Email',
        provider: 'gmail',
        action: 'send_email',
        icon: 'Mail',
        desc: 'Dispatch outbound formatted emails',
        defaultConfig: { to: 'user@example.com', subject: 'Automated notification', body: 'Report: {{nodes.node_1.output}}' }
      }
    ]
  },
  {
    id: 'logic',
    name: 'Logic & Flow',
    items: [
      {
        type: 'custom',
        category: 'logic',
        label: 'Condition & Filter',
        provider: 'core',
        action: 'filter',
        icon: 'Filter',
        desc: 'Branch execution based on variables',
        defaultConfig: { field: 'status', operator: 'equals', value: 'approved' }
      }
    ]
  }
];

export default function NodePalette({ onAddNode }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = PALETTE_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const matchSearch = item.label.toLowerCase().includes(search.toLowerCase()) ||
                          item.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'all' || selectedCategory === cat.id;
      return matchSearch && matchCat;
    })
  })).filter(cat => cat.items.length > 0);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none z-10 font-sans shadow-soft-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Node Palette</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['all', 'triggers', 'ai', 'integrations', 'logic'].map((catId) => (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase whitespace-nowrap transition ${
                selectedCategory === catId
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {catId}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes Scroll Area */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-2.5">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {category.name}
            </h4>

            <div className="space-y-2">
              {category.items.map((node, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => onDragStart(e, node)}
                  onClick={() => onAddNode && onAddNode(node)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-soft-sm transition-all cursor-grab active:cursor-grabbing group select-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {node.label}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {node.desc}
                      </p>
                    </div>

                    <span className="text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
                      {node.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
