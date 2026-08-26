import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: {
      border: 'border-slate-200 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      accent: 'text-indigo-600',
      bar: 'bg-indigo-600'
    },
    emerald: {
      border: 'border-slate-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'text-emerald-600',
      bar: 'bg-emerald-600'
    },
    purple: {
      border: 'border-slate-200 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'text-purple-600',
      bar: 'bg-purple-600'
    },
    amber: {
      border: 'border-slate-200 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'text-amber-600',
      bar: 'bg-amber-600'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all duration-200 shadow-soft-sm hover:shadow-soft-md ${scheme.border} font-sans`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1.5">
          <span>{subtitle}</span>
        </p>
      )}

      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${scheme.bar} rounded-full`} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
