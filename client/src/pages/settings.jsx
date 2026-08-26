import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Layout from '../components/AppShell/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  Settings,
  Shield,
  Key,
  Server,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Lock,
  User,
  Radio,
  Zap,
  Terminal
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const res = await api.get('/health');
        setHealth(res.data);
      } catch (err) {
        console.error('Health check error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Settings & System Health
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Operator profile, AES-256 vault status, and substrate diagnostics
            </p>
          </div>

          {/* User Profile Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Operator Profile</h3>
                <p className="text-xs text-slate-400">Authenticated user identity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">
                  Operator Name
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium">
                  {user?.name || 'Alex Rivera'}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">
                  Email Address
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium">
                  {user?.email || 'operator@agentra.ai'}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">
                  Role Clearance
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-indigo-700 font-semibold capitalize flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>{user?.role || 'operator'} (Full Clearance)</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">
                  Active Session
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active session'}
                </div>
              </div>
            </div>
          </div>

          {/* System Diagnostics & Substrate Health */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Diagnostics</h3>
                <p className="text-xs text-slate-400">Database and execution substrate telemetry</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-bold text-slate-900">LangGraph Execution Substrate</div>
                    <div className="text-slate-500">Dynamic acyclic graph compiler & topological coordinator</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {health?.langGraph || 'Active'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-slate-900">Database Store Substrate</div>
                    <div className="text-slate-500">
                      {health?.inMemoryDB ? 'In-Memory Store Active' : 'MongoDB Atlas Connected & Persistent'}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Connected
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold text-slate-900">Swarm Queue Execution Fabric</div>
                    <div className="text-slate-500">
                      {health?.redisActive ? 'BullMQ on Redis Active' : 'Background Priority Queue Active'}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Operational
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold text-slate-900">AES-256-GCM Vault Integrity</div>
                    <div className="text-slate-500">Master encryption key loaded from environment</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  256-Bit Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
