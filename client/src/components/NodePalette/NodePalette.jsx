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
  Layers,
  MessageCircle,
  Send,
  Linkedin,
  Instagram,
  Facebook,
  Share2,
  Radio
} from 'lucide-react';

const PALETTE_CATEGORIES = [
  {
    id: 'messaging',
    name: 'Direct Messaging & Chat',
    items: [
      {
        type: 'custom',
        category: 'messaging',
        label: 'WhatsApp Direct Message',
        provider: 'whatsapp',
        action: 'send_message',
        icon: 'MessageCircle',
        desc: 'Send WhatsApp alerts, OTPs, & customer updates',
        defaultConfig: { to: '+1234567890', message: 'Hello from RUNA: {{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'messaging',
        label: 'Telegram Bot Alert',
        provider: 'telegram',
        action: 'send_alert',
        icon: 'Send',
        desc: 'Post alerts & broadcasts to Telegram channels',
        defaultConfig: { chatId: '@runa_ops_channel', message: 'Alert: {{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'messaging',
        label: 'Slack Message Dispatch',
        provider: 'slack',
        action: 'post_message',
        icon: 'MessageSquare',
        desc: 'Post rich messages to team Slack channels',
        defaultConfig: { channel: '#operations', message: 'Update: {{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'messaging',
        label: 'Discord Server Broadcast',
        provider: 'discord',
        action: 'post_message',
        icon: 'Bot',
        desc: 'Send rich embeds to Discord war rooms',
        defaultConfig: { channelId: 'incident-room', message: 'Incident: {{nodes.node_1.output}}' }
      }
    ]
  },
  {
    id: 'social',
    name: 'Social Media & Growth',
    items: [
      {
        type: 'custom',
        category: 'social',
        label: 'LinkedIn Post Publisher',
        provider: 'linkedin',
        action: 'create_post',
        icon: 'Linkedin',
        desc: 'Auto-publish thought leadership & updates on LinkedIn',
        defaultConfig: { text: 'Exciting AI innovation: {{nodes.node_1.output}} #AI #Automation', author: 'Executive' }
      },
      {
        type: 'custom',
        category: 'social',
        label: 'Instagram Media & Reels',
        provider: 'instagram',
        action: 'post_media',
        icon: 'Instagram',
        desc: 'Publish captions, carousels, & stories on Instagram',
        defaultConfig: { caption: 'Discover how RUNA orchestrates AI swarms ⚡ #Tech #AI', mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe' }
      },
      {
        type: 'custom',
        category: 'social',
        label: 'Facebook Page Broadcast',
        provider: 'facebook',
        action: 'publish_post',
        icon: 'Facebook',
        desc: 'Publish updates, articles, & lead forms to Facebook Pages',
        defaultConfig: { message: 'Check out our new release powered by RUNA: {{nodes.node_1.output}}' }
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
        label: 'Gemini Reasoning Agent',
        provider: 'ai',
        action: 'ai_process',
        icon: 'Sparkles',
        desc: 'Multimodal reasoning, entity extraction, & synthesis',
        defaultConfig: { prompt: 'Analyze payload and formulate actionable resolution', model: 'gemini-2.5-flash' }
      },
      {
        type: 'custom',
        category: 'ai_agent',
        label: 'Viral Social Copywriter',
        provider: 'ai',
        action: 'ai_process',
        icon: 'Sparkles',
        desc: 'Generate viral hooks, hashtags, & tailored captions',
        defaultConfig: { prompt: 'Create 3 viral social hooks with relevant hashtags' }
      },
      {
        type: 'custom',
        category: 'ai_agent',
        label: 'Sentiment & Urgency Classifier',
        provider: 'ai',
        action: 'sentiment_analysis',
        icon: 'Cpu',
        desc: 'Detect sentiment polarity, frustration, & urgency',
        defaultConfig: { prompt: 'Score sentiment from 0.0 (negative) to 1.0 (positive)' }
      },
      {
        type: 'custom',
        category: 'ai_agent',
        label: 'Executive Summarizer',
        provider: 'ai',
        action: 'summarize',
        icon: 'Sparkles',
        desc: 'Condense large text into structured bullet points',
        defaultConfig: { prompt: 'Summarize top 3 actionable items' }
      }
    ]
  },
  {
    id: 'triggers',
    name: 'Triggers & Ingestion',
    items: [
      {
        type: 'custom',
        category: 'trigger',
        label: 'Webhook Trigger',
        provider: 'webhook',
        action: 'receive_webhook',
        icon: 'Zap',
        desc: 'Listen for inbound JSON webhooks (Stripe, GitHub, etc.)',
        defaultConfig: { endpoint: '/api/v1/trigger' }
      },
      {
        type: 'custom',
        category: 'trigger',
        label: 'Gmail Inbound Filter',
        provider: 'gmail',
        action: 'read_inbox',
        icon: 'Mail',
        desc: 'Trigger on incoming unread emails matching filter',
        defaultConfig: { query: 'is:unread', maxResults: 5 }
      },
      {
        type: 'custom',
        category: 'trigger',
        label: 'Scheduled Cron Timer',
        provider: 'schedule',
        action: 'cron_trigger',
        icon: 'Clock',
        desc: 'Automated recurring cron schedule',
        defaultConfig: { cron: '0 9 * * 1-5' }
      }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity & Persistence',
    items: [
      {
        type: 'custom',
        category: 'integration',
        label: 'Google Sheets Audit Record',
        provider: 'google-sheets',
        action: 'append_row',
        icon: 'Table',
        desc: 'Append live audit rows to Google Sheets',
        defaultConfig: { spreadsheetId: '1Financial_Operations_2026', range: 'Audit!A:E', values: '{{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'integration',
        label: 'Gmail Send Email',
        provider: 'gmail',
        action: 'send_email',
        icon: 'Mail',
        desc: 'Dispatch formatted outbound email messages',
        defaultConfig: { to: 'client@company.com', subject: 'RUNA Notification', body: 'Report: {{nodes.node_1.output}}' }
      },
      {
        type: 'custom',
        category: 'logic',
        label: 'Conditional Branch / Filter',
        provider: 'core',
        action: 'filter',
        icon: 'Filter',
        desc: 'Branch execution based on variables or conditions',
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
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none z-10 font-sans shadow-soft-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Node Palette</h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
            Drag to Canvas
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search WhatsApp, LinkedIn, AI, Sheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['all', 'messaging', 'social', 'ai', 'triggers', 'productivity'].map((catId) => (
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
