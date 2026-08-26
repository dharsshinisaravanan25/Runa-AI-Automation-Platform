import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow
} from '@xyflow/react';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { useWorkflowStore } from '../../store/workflowStore';

const nodeTypes = {
  custom: CustomNode
};

const edgeTypes = {
  custom: CustomEdge
};

export default function WorkflowCanvas() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const addNode = useWorkflowStore((state) => state.addNode);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const nodeDef = JSON.parse(rawData);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNode = {
        id: `node_${nodes.length + 1}_${Date.now().toString().slice(-4)}`,
        type: 'custom',
        position,
        data: {
          label: nodeDef.label,
          category: nodeDef.category,
          icon: nodeDef.icon,
          provider: nodeDef.provider,
          action: nodeDef.action,
          color: nodeDef.color,
          config: { ...nodeDef.defaultConfig }
        }
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode, nodes.length]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="flex-1 h-full w-full relative bg-[#090D16]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true
        }}
      >
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor={(n) => {
            if (n.data?.category === 'trigger') return '#10B981';
            if (n.data?.category === 'ai_agent') return '#8B5CF6';
            if (n.data?.category === 'integration') return '#06B6D4';
            return '#64748B';
          }}
          maskColor="rgba(9, 13, 22, 0.7)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1E293B" />
      </ReactFlow>
    </div>
  );
}
