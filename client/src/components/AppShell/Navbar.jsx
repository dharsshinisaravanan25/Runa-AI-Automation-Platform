import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { Bell, User, LogOut, Radio, ChevronRight, Shield, Zap } from 'lucide-react';
import { getSocket } from '../../services/socket';

export default function Navbar({ onOpenNotifications }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [socketConnected, setSocketConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (socket.connected) setSocketConnected(true);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onNewNotif = () => setUnreadCount((c) => c + 1);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification:new', onNewNotif);
    socket.on('notification:broadcast', onNewNotif);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification:new', onNewNotif);
      socket.off('notification:broadcast', onNewNotif);
    };
  }, []);

  const getPageTitle = () => {
    const path = router.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/workflows/builder')) return 'AI Workflow Studio';
    if (path.startsWith('/workflows/')) return 'Workflow Canvas Editor';
    if (path.startsWith('/workflows')) return 'Workflows Matrix';
    if (path.startsWith('/executions/')) return 'Execution Trace Inspector';
    if (path.startsWith('/executions')) return 'Executions Stream';
    if (path.startsWith('/integrations')) return 'Integrations & Credentials Vault';
    if (path.startsWith('/settings')) return 'Substrate Diagnostics & Settings';
    return 'RUNA Console';
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-soft-sm font-sans">
      {/* Breadcrumb & Path */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-indigo-600 fill-current" />
          <span>RUNA</span>
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <h1 className="font-semibold text-slate-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Tools & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Socket Stream Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
          <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-medium text-slate-600">
            {socketConnected ? 'Live Socket Stream' : 'Connecting...'}
          </span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => {
            setUnreadCount(0);
            onOpenNotifications();
          }}
          className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-soft-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
          )}
        </button>

        {/* User Operator Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{user?.name || 'RUNA Operator'}</div>
            <div className="text-[11px] text-slate-500 capitalize">
              {user?.role || 'operator'}
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-soft-sm ring-1 ring-indigo-200">
            {(user?.name || 'R').charAt(0).toUpperCase()}
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
