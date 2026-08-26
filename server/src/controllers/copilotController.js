const axios = require('axios');
const env = require('../config/env');
const db = require('../models/dbAdapter');

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest'
];

class CopilotController {
  async chatWithCopilot(req, res, next) {
    try {
      const { id } = req.params;
      const { message, currentNodes = [], currentEdges = [], history = [] } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_MESSAGE', message: 'Message text is required' }
        });
      }

      const prompt = message.trim();

      const systemPrompt = `You are Runa Assist, an intelligent autonomous workflow co-pilot and pair-architect for the RUNA operations platform.
The user is currently editing a visual React Flow workflow graph on their screen.

CURRENT WORKFLOW GRAPH ON USER'S SCREEN:
Nodes: ${JSON.stringify(currentNodes, null, 2)}
Edges: ${JSON.stringify(currentEdges, null, 2)}

SUPPORTED PROVIDERS & ACTIONS:
- whatsapp: send_message { to, message }, send_template { templateName, to }
- telegram: send_alert { chatId, message }, broadcast_group { groupId }
- linkedin: create_post { text, author }, send_inmail { recipient, message }
- instagram: post_media { caption, mediaUrl }, reply_dm { replyText }
- facebook: publish_post { message, pageId }, process_lead { formName }
- google-sheets: append_row { spreadsheetId, range, values }, read_range { spreadsheetId, range }
- gmail: read_inbox { query }, send_email { to, subject, body }
- slack: post_message { channel, message }
- discord: post_message { channelId, message }
- ai: ai_process { prompt }, summarize { prompt }, sentiment_analysis { prompt }
- webhook: receive_webhook { endpoint }
- schedule: cron_trigger { cron }

YOUR INSTRUCTIONS:
1. If the user asks to add, remove, connect, rewire, or update nodes, modify the graph accordingly.
   - Return updated \`nodes\` and \`edges\` arrays.
   - Ensure nodes have distinct IDs (e.g. \`node_\${Date.now()}\`), position { x, y } placed logically (x spaced by ~320px), and valid data { label, category, icon, provider, action, config }.
   - Ensure edges correctly connect source -> target.
2. Provide a helpful, concise explanation of the change in \`reply\` signed as Runa Assist.
3. If the user is only asking a question or seeking advice, keep nodes and edges unchanged and provide a friendly, insightful answer.

Output must strictly be valid JSON matching:
{
  "reply": "Clear, friendly explanation of actions taken or answers to questions",
  "actionTaken": "GRAPH_UPDATED" | "CHAT_REPLY",
  "nodes": [ ... ],
  "edges": [ ... ]
}`;

      let result = null;

      // 1. Try Gemini API
      if (env.GEMINI_API_KEY) {
        for (const model of GEMINI_MODELS) {
          try {
            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
              {
                contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }],
                generationConfig: {
                  response_mime_type: 'application/json',
                  temperature: 0.2
                }
              },
              { timeout: 25000 }
            );

            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
              break;
            }
          } catch (err) {
            console.warn(`Copilot Gemini model ${model} failed:`, err.response?.data?.error?.message || err.message);
          }
        }
      }

      // 2. Fallback Rule-Based Co-Pilot Engine
      if (!result) {
        result = this.fallbackCopilotEngine(prompt, currentNodes, currentEdges);
      }

      // Ensure nodes and edges are populated
      if (!result.nodes || result.nodes.length === 0) {
        result.nodes = currentNodes;
      }
      if (!result.edges) {
        result.edges = currentEdges;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  fallbackCopilotEngine(prompt, currentNodes = [], currentEdges = []) {
    const p = prompt.toLowerCase();
    const nodes = [...currentNodes];
    const edges = [...currentEdges];

    const lastNode = nodes[nodes.length - 1];
    const lastX = lastNode ? lastNode.position.x + 320 : 100;
    const lastY = lastNode ? lastNode.position.y : 220;

    // 1. Add WhatsApp
    if (p.includes('whatsapp')) {
      const phoneMatch = prompt.match(/(\+?\d[\d\s\-]{8,15}\d)/);
      const targetPhone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '+1234567890';
      const newNodeId = `node_${Date.now()}`;

      nodes.push({
        id: newNodeId,
        type: 'custom',
        position: { x: lastX, y: lastY },
        data: {
          label: 'WhatsApp Direct Alert',
          category: 'messaging',
          icon: 'MessageCircle',
          provider: 'whatsapp',
          action: 'send_message',
          config: { to: targetPhone, message: '🚨 *RUNA Alert*: {{nodes.node_2.output}}' }
        }
      });

      if (lastNode) {
        edges.push({ id: `e-${lastNode.id}-${newNodeId}`, source: lastNode.id, target: newNodeId, animated: true });
      }

      return {
        reply: `⚡ I've added a WhatsApp Alert step configured for ${targetPhone} and automatically connected it to your workflow.`,
        actionTaken: 'GRAPH_UPDATED',
        nodes,
        edges
      };
    }

    // 2. Add Telegram
    if (p.includes('telegram')) {
      const newNodeId = `node_${Date.now()}`;
      nodes.push({
        id: newNodeId,
        type: 'custom',
        position: { x: lastX, y: lastY },
        data: {
          label: 'Telegram War Room Broadcast',
          category: 'messaging',
          icon: 'Send',
          provider: 'telegram',
          action: 'send_alert',
          config: { chatId: '@runa_ops_channel', message: '⚡ Alert: {{nodes.node_2.output}}' }
        }
      });

      if (lastNode) {
        edges.push({ id: `e-${lastNode.id}-${newNodeId}`, source: lastNode.id, target: newNodeId, animated: true });
      }

      return {
        reply: `✈️ Added a Telegram alert node pointing to @runa_ops_channel and wired it into your DAG sequence.`,
        actionTaken: 'GRAPH_UPDATED',
        nodes,
        edges
      };
    }

    // 3. Add Google Sheets
    if (p.includes('sheet') || p.includes('excel') || p.includes('log')) {
      const newNodeId = `node_${Date.now()}`;
      nodes.push({
        id: newNodeId,
        type: 'custom',
        position: { x: lastX, y: lastY + 80 },
        data: {
          label: 'Google Sheets Audit Ledger',
          category: 'integration',
          icon: 'Table',
          provider: 'google-sheets',
          action: 'append_row',
          config: { spreadsheetId: '1Customer_Operations_2026', range: 'Sheet1!A:E', values: '{{nodes.node_1.output}}' }
        }
      });

      if (lastNode) {
        edges.push({ id: `e-${lastNode.id}-${newNodeId}`, source: lastNode.id, target: newNodeId, animated: true });
      }

      return {
        reply: `📊 Added a Google Sheets logging step to record audit rows into your spreadsheet.`,
        actionTaken: 'GRAPH_UPDATED',
        nodes,
        edges
      };
    }

    // 4. General Assistance
    return {
      reply: `🤖 I'm Runa Assist, your autonomous workflow co-pilot. You currently have ${nodes.length} nodes configured. You can ask me to add WhatsApp, Telegram, LinkedIn, Instagram, or Sheets nodes, or wire steps together automatically!`,
      actionTaken: 'CHAT_REPLY',
      nodes,
      edges
    };
  }
}

module.exports = new CopilotController();
