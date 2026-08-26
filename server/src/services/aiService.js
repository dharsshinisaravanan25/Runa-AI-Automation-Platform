const axios = require('axios');
const env = require('../config/env');

class AIService {
  async generateWorkflowFromPrompt(prompt, userId) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required for workflow generation');
    }

    const cleanPrompt = prompt.trim();

    // 1. Try OpenRouter if API Key exists
    if (env.OPENROUTER_API_KEY) {
      try {
        const generated = await this.generateWithOpenRouter(cleanPrompt);
        if (generated && generated.nodes && generated.nodes.length > 0) {
          return generated;
        }
      } catch (err) {
        console.warn('OpenRouter workflow generation failed, falling back to Gemini:', err.message);
      }
    }

    // 2. Try Gemini if API Key exists
    if (env.GEMINI_API_KEY) {
      try {
        const generated = await this.generateWithGemini(cleanPrompt);
        if (generated && generated.nodes && generated.nodes.length > 0) {
          return generated;
        }
      } catch (err) {
        console.warn('Gemini workflow generation failed, falling back to Deterministic Rule Engine:', err.message);
      }
    }

    // 3. Fallback: Deterministic Rule-Based Workflow Builder
    return this.buildDeterministicWorkflow(cleanPrompt);
  }

  async generateWithOpenRouter(prompt) {
    const systemPrompt = `You are an expert Workflow Architect for an AI Operations Automation Platform.
Given an automation description in natural language, output ONLY a valid JSON object representing an executable workflow graph with nodes, coordinates, and edges.
Format:
{
  "name": "Descriptive Workflow Title",
  "description": "Clear explanation of the automation pipeline",
  "tags": ["AI", "Integrations", "Ops"],
  "triggerConfig": { "type": "manual" | "schedule" | "webhook" | "gmail_trigger", "schedule": "" },
  "nodes": [
    {
      "id": "node_1",
      "type": "custom",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Step Title",
        "category": "trigger" | "ai_agent" | "integration" | "logic",
        "icon": "Mail" | "MessageSquare" | "Bot" | "Table" | "Sparkles" | "Cpu" | "Filter",
        "provider": "gmail" | "slack" | "discord" | "google-sheets" | "ai",
        "action": "send_email" | "read_inbox" | "post_message" | "append_row" | "ai_process" | "summarize" | "filter",
        "config": { ... }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node_1", "target": "node_2", "animated": true }
  ]
}
Return ONLY valid raw JSON, with no markdown code blocks.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://agentflow.ai',
          'X-Title': 'Agentflow AI'
        },
        timeout: 4000
      }
    );

    let text = response.data.choices[0]?.message?.content || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  async generateWithGemini(prompt) {
    const systemPrompt = `You are a Workflow Architect. Return ONLY JSON matching { name, description, tags, triggerConfig, nodes, edges }. Nodes must have id, type: 'custom', position: { x, y }, data: { label, category, icon, provider, action, config }. Return raw JSON only.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser Request: ${prompt}` }
            ]
          }
        ]
      },
      { timeout: 8000 }
    );

    let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  buildDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();

    // 1. Invoice & Payment Processing Template
    if (p.includes('invoice') || p.includes('stripe') || p.includes('payment') || p.includes('bill')) {
      return {
        name: 'Automated Invoice Triage & Sheet Recording',
        description: 'Monitors incoming billing emails, extracts invoice details via AI Agent, logs record into Google Sheets, and notifies Slack channel.',
        tags: ['Finance', 'AI Agent', 'Sheets', 'Slack'],
        triggerConfig: { type: 'gmail_trigger', filter: 'has:attachment invoice' },
        nodes: [
          {
            id: 'node_1',
            type: 'custom',
            position: { x: 100, y: 220 },
            data: {
              label: 'Gmail Invoice Ingestion',
              category: 'trigger',
              icon: 'Mail',
              provider: 'gmail',
              action: 'read_inbox',
              config: {
                query: 'subject:Invoice OR subject:Bill',
                maxResults: 5
              }
            }
          },
          {
            id: 'node_2',
            type: 'custom',
            position: { x: 420, y: 220 },
            data: {
              label: 'AI Data Extraction Agent',
              category: 'ai_agent',
              icon: 'Sparkles',
              provider: 'ai',
              action: 'ai_process',
              config: {
                prompt: 'Extract vendor name, invoice number, due date, total amount, and line items as structured JSON from this email.',
                model: 'auto'
              }
            }
          },
          {
            id: 'node_3',
            type: 'custom',
            position: { x: 740, y: 140 },
            data: {
              label: 'Google Sheets Audit Ledger',
              category: 'integration',
              icon: 'Table',
              provider: 'google-sheets',
              action: 'append_row',
              config: {
                spreadsheetId: '1Financial_Operations_Ledger_2026',
                range: 'Invoices!A:F',
                values: '{{nodes.node_2.output.extractedEntities}}'
              }
            }
          },
          {
            id: 'node_4',
            type: 'custom',
            position: { x: 740, y: 320 },
            data: {
              label: 'Slack Finance Dispatch',
              category: 'integration',
              icon: 'MessageSquare',
              provider: 'slack',
              action: 'post_message',
              config: {
                channel: '#finance-ops',
                message: '⚡ New Invoice parsed by AI Agent! Total amount: {{nodes.node_2.output.amount}} from {{nodes.node_2.output.vendor}}.'
              }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true }
        ]
      };
    }

    // 2. Customer Support & Sentiment Escalation Template
    if (p.includes('support') || p.includes('customer') || p.includes('ticket') || p.includes('sentiment')) {
      return {
        name: 'AI Customer Sentiment & Priority Router',
        description: 'Analyzes customer inquiries, detects urgent sentiment, logs tickets into Google Sheets, and escalates VIP issues to Discord & Slack.',
        tags: ['Support', 'AI Agent', 'Sentiment', 'Discord'],
        triggerConfig: { type: 'webhook', webhookPath: '/webhook/customer-tickets' },
        nodes: [
          {
            id: 'node_1',
            type: 'custom',
            position: { x: 100, y: 220 },
            data: {
              label: 'Webhook Ticket Ingestion',
              category: 'trigger',
              icon: 'Zap',
              provider: 'webhook',
              action: 'receive_webhook',
              config: { endpoint: '/api/v1/inbound-tickets' }
            }
          },
          {
            id: 'node_2',
            type: 'custom',
            position: { x: 400, y: 220 },
            data: {
              label: 'AI Sentiment & Severity Agent',
              category: 'ai_agent',
              icon: 'Cpu',
              provider: 'ai',
              action: 'sentiment_analysis',
              config: {
                prompt: 'Assess urgency, customer satisfaction sentiment (0.0 to 1.0), and classify root cause category.',
                model: 'auto'
              }
            }
          },
          {
            id: 'node_3',
            type: 'custom',
            position: { x: 720, y: 140 },
            data: {
              label: 'Discord VIP Urgent Broadcast',
              category: 'integration',
              icon: 'Bot',
              provider: 'discord',
              action: 'post_message',
              config: {
                channelId: 'ops-alerts-101',
                title: '🚨 High Priority Customer Escalation',
                message: 'Sentiment: {{nodes.node_2.output.sentiment}} | Urgent attention needed for ticket.'
              }
            }
          },
          {
            id: 'node_4',
            type: 'custom',
            position: { x: 720, y: 320 },
            data: {
              label: 'Support Operations Sheet',
              category: 'integration',
              icon: 'Table',
              provider: 'google-sheets',
              action: 'append_row',
              config: {
                spreadsheetId: '1Customer_Support_Metrics',
                range: 'Tickets!A:E',
                values: '{{nodes.node_1.output.id}}, {{nodes.node_2.output.sentiment}}, {{nodes.node_2.output.confidenceScore}}'
              }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true }
        ]
      };
    }

    // 3. Email Digest & Slack Summary Template
    if (p.includes('email') || p.includes('gmail') || p.includes('digest') || p.includes('summary')) {
      return {
        name: 'Executive Inbox AI Digest & Slack Dispatch',
        description: 'Periodically reads critical unread emails, summarizes key action items via AI, and posts concise morning digest to Slack.',
        tags: ['Gmail', 'AI Summarizer', 'Slack', 'Productivity'],
        triggerConfig: { type: 'schedule', schedule: '0 9 * * 1-5' },
        nodes: [
          {
            id: 'node_1',
            type: 'custom',
            position: { x: 100, y: 220 },
            data: {
              label: 'Gmail Unread Fetcher',
              category: 'trigger',
              icon: 'Mail',
              provider: 'gmail',
              action: 'read_inbox',
              config: { query: 'is:unread label:important', maxResults: 10 }
            }
          },
          {
            id: 'node_2',
            type: 'custom',
            position: { x: 420, y: 220 },
            data: {
              label: 'AI Executive Summarizer',
              category: 'ai_agent',
              icon: 'Sparkles',
              provider: 'ai',
              action: 'summarize',
              config: {
                prompt: 'Summarize top 3 actionable items from these messages into bullet points with assigned priorities.',
                model: 'auto'
              }
            }
          },
          {
            id: 'node_3',
            type: 'custom',
            position: { x: 740, y: 220 },
            data: {
              label: 'Slack Executive Digest',
              category: 'integration',
              icon: 'MessageSquare',
              provider: 'slack',
              action: 'post_message',
              config: {
                channel: '#executive-briefing',
                message: '🌅 *Daily Operations AI Digest*\n{{nodes.node_2.output.content}}'
              }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true }
        ]
      };
    }

    // 4. Default General Multi-Agent Operations Pipeline
    return {
      name: 'Omni-Channel Operations Automation',
      description: `Automated agentic workflow generated from prompt: "${prompt}"`,
      tags: ['Multi-Agent', 'Automation', 'Cross-Platform'],
      triggerConfig: { type: 'manual' },
      nodes: [
        {
          id: 'node_1',
          type: 'custom',
          position: { x: 100, y: 220 },
          data: {
            label: 'Workflow Trigger Event',
            category: 'trigger',
            icon: 'Zap',
            provider: 'webhook',
            action: 'manual_trigger',
            config: { payload: { initiatedBy: 'operator', timestamp: new Date().toISOString() } }
          }
        },
        {
          id: 'node_2',
          type: 'custom',
          position: { x: 400, y: 220 },
          data: {
            label: 'AI Reasoning & Transform Agent',
            category: 'ai_agent',
            icon: 'Cpu',
            provider: 'ai',
            action: 'ai_process',
            config: {
              prompt: `Execute operational reasoning for: ${prompt}`,
              model: 'auto'
            }
          }
        },
        {
          id: 'node_3',
          type: 'custom',
          position: { x: 720, y: 140 },
          data: {
            label: 'Slack Notification Dispatch',
            category: 'integration',
            icon: 'MessageSquare',
            provider: 'slack',
            action: 'post_message',
            config: {
              channel: '#operations',
              message: '🤖 AI Automation Executed: {{nodes.node_2.output.content}}'
            }
          }
        },
        {
          id: 'node_4',
          type: 'custom',
          position: { x: 720, y: 320 },
          data: {
            label: 'Audit Trail Ledger',
            category: 'integration',
            icon: 'Table',
            provider: 'google-sheets',
            action: 'append_row',
            config: {
              spreadsheetId: '1Audit_Log_Spreadsheet',
              range: 'Audit!A:D',
              values: '{{nodes.node_1.output.timestamp}}, {{nodes.node_2.output.category}}, SUCCESS'
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
        { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
        { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true }
      ]
    };
  }
}

module.exports = new AIService();
