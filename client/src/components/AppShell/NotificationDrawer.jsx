import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, XCircle, Info, CheckCheck, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data?.data?.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:broadcast', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:broadcast', handleNewNotification);
    };
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {}
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-soft-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                <p className="text-xs text-slate-400">Multi-agent live alert stream</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{notifications.length} alerts recorded</span>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 rounded transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark read
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-600 px-2 py-1 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-700 font-bold">All systems nominal</p>
                <p className="text-xs text-slate-400 mt-1">No alerts or agent escalations logged.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const id = n._id || n.id;
                return (
                  <div
                    key={id}
                    onClick={() => markSingleAsRead(id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      n.isRead
                        ? 'bg-slate-50/60 border-slate-200/70 text-slate-600'
                        : 'bg-white border-indigo-200 text-slate-900 shadow-soft-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(n.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-bold truncate ${n.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs mt-1 text-slate-500 leading-relaxed break-words">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-2 block">
                          {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
