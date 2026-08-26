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
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { Loader2 } from 'lucide-react';

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

  const handleExecute = async () => {
    if (!id) return;
    try {
      setIsExecuting(true);
      await handleSave();

      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: { initiatedBy: 'canvas_operator' }
      });
      const execution = res.data?.data?.execution;
      if (execution && execution._id) {
        router.push(`/executions/${execution._id}`);
      }
    } catch (err) {
      alert('Execution dispatch failed: ' + (err.response?.data?.error?.message || err.message));
      setIsExecuting(false);
    }
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
              onExecute={handleExecute}
              isSaving={isSaving}
              isExecuting={isExecuting}
              nodeCount={nodes.length}
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
