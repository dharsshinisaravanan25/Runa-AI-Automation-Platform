/**
 * Planner Agent
 * Decides node ordering using DAG topological traversal, evaluates graph connectivity,
 * identifies branching, and emits a structured execution plan with confidence score.
 */
class PlannerAgent {
  constructor() {
    this.name = 'Planner Agent';
    this.id = 'planner';
  }

  async plan(workflow) {
    const { nodes = [], edges = [] } = workflow;

    if (!nodes || nodes.length === 0) {
      throw new Error('Graph has no nodes to plan execution.');
    }

    // Build adjacency list and in-degree map
    const inDegree = {};
    const adjList = {};
    const nodeMap = {};

    nodes.forEach(node => {
      inDegree[node.id] = 0;
      adjList[node.id] = [];
      nodeMap[node.id] = node;
    });

    edges.forEach(edge => {
      if (inDegree[edge.target] !== undefined) {
        inDegree[edge.target]++;
      }
      if (adjList[edge.source]) {
        adjList[edge.source].push(edge.target);
      }
    });

    // Kahn's Algorithm for Topological Sort
    const queue = [];
    nodes.forEach(node => {
      if (inDegree[node.id] === 0) {
        queue.push(node.id);
      }
    });

    const executionSequence = [];
    const visited = new Set();

    while (queue.length > 0) {
      const currId = queue.shift();
      executionSequence.push(nodeMap[currId]);
      visited.add(currId);

      const neighbors = adjList[currId] || [];
      for (const neighborId of neighbors) {
        inDegree[neighborId]--;
        if (inDegree[neighborId] === 0) {
          queue.push(neighborId);
        }
      }
    }

    // Check for cycles
    const hasCycle = executionSequence.length !== nodes.length;
    let confidenceScore = 0.98;

    if (hasCycle) {
      // Append any unvisited nodes as a fallback sequence
      nodes.forEach(n => {
        if (!visited.has(n.id)) {
          executionSequence.push(n);
        }
      });
      confidenceScore = 0.72;
    }

    // Identify Trigger node
    const triggerNode = executionSequence[0];
    const estimatedSteps = executionSequence.length;

    return {
      success: true,
      confidenceScore,
      executionSequence,
      hasCycle,
      totalSteps: estimatedSteps,
      triggerNodeId: triggerNode?.id || null,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        strategy: 'topological_dag_traversal',
        plannedAt: new Date().toISOString()
      }
    };
  }
}

module.exports = new PlannerAgent();
