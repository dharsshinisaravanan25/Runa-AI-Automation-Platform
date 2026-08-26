import React from 'react';
import MetricCard from './MetricCard';
import { GitBranch, Play, CheckCircle, Cpu } from 'lucide-react';

export default function MetricGrid({ metrics = {} }) {
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    successRate = 100,
    runningExecutions = 0,
  } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <MetricCard
        title="Total Workflows"
        value={totalWorkflows}
        subtitle={`${activeWorkflows} Active in Platform`}
        icon={GitBranch}
        color="indigo"
      />

      <MetricCard
        title="Executions"
        value={totalExecutions}
        subtitle={runningExecutions > 0 ? `${runningExecutions} In-Flight` : 'Queue Idle'}
        icon={Play}
        color="purple"
      />

      <MetricCard
        title="Success Rate"
        value={`${successRate}%`}
        subtitle="Self-healing enabled"
        icon={CheckCircle}
        color="emerald"
        trend="99.8% SLA"
      />

      <MetricCard
        title="Active Agents"
        value="5 Swarm"
        subtitle="Planner • Exec • Val • Rec • Mon"
        icon={Cpu}
        color="amber"
      />
    </div>
  );
}
