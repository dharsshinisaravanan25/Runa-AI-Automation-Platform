import React from 'react';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  PlayCircle,
  Puzzle,
  Settings,
  Radio,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: GitBranch },
    { name: 'AI Builder', href: '/workflows/builder', icon: Sparkles, badge: 'New' },
    { name: 'Executions', href: '/executions', icon: PlayCircle },
    { name: 'Integrations', href: '/integrations', icon: Puzzle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/workflows' && router.pathname.startsWith('/workflows/builder')) {
      return false;
    }
    return router.pathname === path || (path !== '/dashboard' && router.pathname.startsWith(path));
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none z-30 shadow-soft-sm font-sans">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white">
        <div 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-slate-900 tracking-tight">Agentra</span>
              <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Autonomous Operations</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition ${
                  active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Swarm Engine Status Widget */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-800">Swarm Engine</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Online
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>5 Cooperating Agents</span>
            <span className="text-slate-700 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
