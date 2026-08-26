import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import Layout from '../../components/AppShell/Layout';
import CustomNode from '../../components/WorkflowCanvas/CustomNode';
import WorkflowToolbar from '../../components/WorkflowCanvas/WorkflowToolbar';
import NodePalette from '../../components/NodePalette/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import CanvasCopilot from '../../components/WorkflowCanvas/CanvasCopilot';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { Loader2, Terminal, Play, Sparkles, Send, MessageCircle } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode
};

export default function WorkflowCanvasPage() {
  const router = useRouter();
  const { id } = router.query;

  const [workflow, setWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('Workflow Blueprint');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Quick In-App Sandbox Trigger
  const [showSandbox, setShowSandbox] = useState(false);
  const [testPayload, setTestPayload] = useState('{\n  "source": "lead_webhook",\n  "name": "Sarah Jenkins",\n  "company": "Nexus Corp",\n  "intent": "High Priority Enterprise"\n}');

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const fetchWorkflow = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/workflows/${id}`);
      const wf = res.data?.data?.workflow;
      if (wf) {
        setWorkflow(wf);
        setWorkflowName(wf.name || 'Untitled Workflow');
        setNodes(wf.nodes || []);
        setEdges(
          (wf.edges || []).map((e) => ({
            ...e,
            animated: true,
            style: { stroke: '#6366F1', strokeWidth: 2 }
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#6366F1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' }
          },
          eds
        )
      ),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const nodeTemplate = JSON.parse(rawData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: nodeTemplate.label,
          category: nodeTemplate.category,
          icon: nodeTemplate.icon,
          provider: nodeTemplate.provider,
          action: nodeTemplate.action,
          config: nodeTemplate.defaultConfig || {}
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleAddNodeFromPalette = (nodeTemplate) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: {
        x: 250 + Math.random() * 80,
        y: 200 + Math.random() * 80
      },
      data: {
        label: nodeTemplate.label,
        category: nodeTemplate.category,
        icon: nodeTemplate.icon,
        provider: nodeTemplate.provider,
        action: nodeTemplate.action,
        config: nodeTemplate.defaultConfig || {}
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleUpdateNode = (nodeId, updatedData) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: updatedData } : n))
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev) => ({ ...prev, data: updatedData }));
    }
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setIsSaving(true);
      await api.put(`/workflows/${id}`, {
        name: workflowName,
        nodes,
        edges
      });
    } catch (err) {
      alert('Failed to save workflow: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async (customPayload = null) => {
    if (!id) return;
    try {
      setIsExecuting(true);
      await handleSave();

      let inputs = { initiatedBy: 'canvas_operator' };
      if (customPayload) {
        try {
          inputs = JSON.parse(customPayload);
        } catch (e) {
          inputs = { raw: customPayload };
        }
      }

      const res = await api.post(`/workflows/${id}/execute`, { inputs });
      const execution = res.data?.data?.execution;
      if (execution && execution._id) {
        router.push(`/executions/${execution._id}`);
      }
    } catch (err) {
      alert('Execution dispatch failed: ' + (err.response?.data?.error?.message || err.message));
      setIsExecuting(false);
    }
  };

  const handleApplyGraphUpdate = (newNodes, newEdges) => {
    setNodes(newNodes);
    setEdges(
      (newEdges || []).map((e) => ({
        ...e,
        animated: true,
        style: { stroke: '#6366F1', strokeWidth: 2 }
      }))
    );
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-[calc(100vh-64px)] w-full flex relative overflow-hidden font-sans bg-[#F8FAFC]">
          {/* Node Palette */}
          <NodePalette onAddNode={handleAddNodeFromPalette} />

          {/* React Flow Canvas Container */}
          <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <WorkflowToolbar
              workflowName={workflowName}
              onNameChange={setWorkflowName}
              onSave={handleSave}
              onExecute={() => handleExecute()}
              isSaving={isSaving}
              isExecuting={isExecuting}
              nodeCount={nodes.length}
            />

            {/* Quick In-App Sandbox Trigger Pill */}
            <div className="absolute bottom-6 left-6 z-20">
              <button
                onClick={() => setShowSandbox(!showSandbox)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-soft-md hover:bg-slate-50 transition"
              >
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Test Event Sandbox</span>
              </button>
            </div>

            {/* In-App Test Event Modal Drawer */}
            {showSandbox && (
              <div className="absolute bottom-20 left-6 z-30 w-96 rounded-3xl bg-white border border-slate-200 p-5 shadow-soft-xl space-y-3 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900">Simulate Inbound Event Payload</h4>
                  </div>
                  <button onClick={() => setShowSandbox(false)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
                </div>
                <textarea
                  rows={4}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 resize-none"
                />
                <button
                  onClick={() => {
                    setShowSandbox(false);
                    handleExecute(testPayload);
                  }}
                  disabled={isExecuting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-soft-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute RUNA Swarm with Payload</span>
                </button>
              </div>
            )}

            {/* AI Canvas Co-Pilot Floating Assistant */}
            <CanvasCopilot
              workflowId={id}
              currentNodes={nodes}
              currentEdges={edges}
              onApplyGraphUpdate={handleApplyGraphUpdate}
            />

            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <MiniMap
                  nodeStrokeColor="#6366F1"
                  nodeColor="#EEF2FF"
                  nodeBorderRadius={4}
                  maskColor="rgba(248, 250, 252, 0.7)"
                />
                <Background color="#CBD5E1" gap={24} size={1} />
              </ReactFlow>
            )}
          </div>

          {/* Node Property Config Drawer */}
          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
