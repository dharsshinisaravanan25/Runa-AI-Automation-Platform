/**
 * Automated Verification Test Script for Agentflow_AI Platform
 * Validates: Auth, AES-256 Encryption, AI Generator, Planner DAG, Multi-Agent Swarm
 */

const { connectDB } = require('./src/config/db');
const authService = require('./src/services/authService');
const aiService = require('./src/services/aiService');
const integrationService = require('./src/services/integrationService');
const plannerAgent = require('./src/agents/plannerAgent');
const orchestrator = require('./src/agents/orchestrator');
const db = require('./src/models/dbAdapter');

const runTests = async () => {
  console.log('\x1b[36m%s\x1b[0m', '\n======================================================');
  console.log('\x1b[36m%s\x1b[0m', '   🧪 RUNNING AGENTFLOW_AI AUTOMATED VERIFICATION   ');
  console.log('\x1b[36m%s\x1b[0m', '======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log('\x1b[32m%s\x1b[0m', `  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error('\x1b[31m%s\x1b[0m', `  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // Test 1: In-Memory DB Connection
    await connectDB();
    assert(true, 'Database layer initialized (In-memory zero-config store active)');

    // Test 2: Authentication & Password Hashing (Cost 12)
    const testUser = await authService.register({
      name: 'Test Operator',
      email: `test_${Date.now()}@agentflow.ai`,
      password: 'SecureOperatorPassword123!',
      role: 'operator'
    });
    assert(testUser && testUser.token && testUser.user.id, 'User registration & JWT token generation');

    const loginRes = await authService.login(testUser.user.email, 'SecureOperatorPassword123!');
    assert(loginRes && loginRes.token, 'User login with bcrypt password verification');

    // Test 3: AES-256-GCM Vault Encryption & Decryption
    const sampleToken = { accessToken: 'xoxb-live-slack-token-12345', botUserId: 'U12345' };
    await integrationService.saveManualCredentials(testUser.user.id, 'slack', sampleToken);
    const decrypted = await integrationService.getDecryptedCredentials(testUser.user.id, 'slack');
    assert(
      decrypted && decrypted.accessToken === 'xoxb-live-slack-token-12345',
      'AES-256-GCM credential vault encrypts and decrypts accurately'
    );

    // Test 4: AI Workflow Generation from Prompt
    const generatedWf = await aiService.generateWorkflowFromPrompt(
      'Ingest customer support tickets, analyze sentiment with AI, and post to Slack & Google Sheets',
      testUser.user.id
    );
    assert(
      generatedWf && Array.isArray(generatedWf.nodes) && generatedWf.nodes.length >= 3 && Array.isArray(generatedWf.edges),
      `AI Workflow Generator compiled valid graph with ${generatedWf?.nodes?.length} nodes & ${generatedWf?.edges?.length} edges`
    );

    // Test 5: Planner Agent DAG Topological Sort & Confidence Scoring
    const plan = await plannerAgent.plan(generatedWf);
    assert(
      plan.success && plan.executionSequence.length === generatedWf.nodes.length && plan.confidenceScore >= 0.9,
      `Planner Agent resolved DAG topological order (${plan.totalSteps} steps, Confidence: ${(plan.confidenceScore * 100).toFixed(0)}%)`
    );

    // Test 6: Multi-Agent Orchestration Swarm Execution
    const savedWf = await db.Workflow.create({
      name: generatedWf.name,
      description: generatedWf.description,
      owner: testUser.user.id,
      status: 'active',
      nodes: generatedWf.nodes,
      edges: generatedWf.edges
    });

    const execution = await db.Execution.create({
      workflowId: savedWf._id,
      owner: testUser.user.id,
      workflowSnapshot: savedWf,
      status: 'PENDING',
      inputs: { customerTicketId: 'TCK-9901', priority: 'HIGH' }
    });

    // Run swarm
    await orchestrator.runWorkflow(execution._id);

    const completedExec = await db.Execution.findById(execution._id);
    if (completedExec?.status !== 'COMPLETED') {
      console.log('Execution error details:', JSON.stringify(completedExec?.error, null, 2));
      const logs = await db.ExecutionLog.find({ executionId: execution._id });
      console.log('Execution logs:', logs.map(l => `[${l.agent}] [${l.level}] ${l.message}`));
    }
    assert(
      completedExec && completedExec.status === 'COMPLETED',
      `Multi-Agent Swarm successfully completed run with status ${completedExec?.status} (Duration: ${(completedExec?.duration / 1000).toFixed(2)}s)`
    );

    const logs = await db.ExecutionLog.find({ executionId: execution._id });
    const agentsInvolved = new Set(logs.map(l => l.agent));
    assert(
      logs.length >= 5 && agentsInvolved.has('planner') && agentsInvolved.has('execution') && agentsInvolved.has('validation') && agentsInvolved.has('monitoring'),
      `Audit log persisted ${logs.length} granular agent events across ${agentsInvolved.size} distinct agent types`
    );

  } catch (err) {
    console.error('Test threw unexpected exception:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`\x1b[32m Passed: ${passed}\x1b[0m | \x1b[31m Failed: ${failed}\x1b[0m`);
  console.log('======================================================\n');

  if (failed === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runTests();
