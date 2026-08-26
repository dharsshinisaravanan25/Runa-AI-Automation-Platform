const axios = require('axios');
const env = require('../config/env');

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest'
];

class AIService {
  async generateWorkflowFromPrompt(prompt, userId) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required for workflow generation');
    }

    const cleanPrompt = prompt.trim();

    // 1. Try Gemini if API Key exists
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

    // 2. Try OpenRouter if API Key exists
    if (env.OPENROUTER_API_KEY) {
      try {
        const generated = await this.generateWithOpenRouter(cleanPrompt);
        if (generated && generated.nodes && generated.nodes.length > 0) {
          return generated;
        }
      } catch (err) {
        console.warn('OpenRouter workflow generation failed, falling back to Deterministic Rule Engine:', err.message);
      }
    }

    // 3. Fallback: Smart Dynamic Rule-Based Workflow Builder
    return this.buildDeterministicWorkflow(cleanPrompt);
  }

  async generateWithGemini(prompt) {
    const systemPrompt = `You are an expert Workflow Architect for the RUNA AI Operations Platform.
Convert the user's natural language automation request into an executable workflow DAG graph.
Supported providers:
- webhook (action: receive_webhook, config: { endpoint: string })
- ai (action: ai_process | summarize | sentiment_analysis, config: { prompt: string, model: 'auto' })
- whatsapp (action: send_message | send_template, config: { to: string, message: string })
- telegram (action: send_alert | broadcast_group, config: { chatId: string, message: string })
- linkedin (action: create_post | send_inmail, config: { text: string, author: string })
- instagram (action: post_media | reply_dm, config: { caption: string, mediaUrl: string })
- facebook (action: publish_post | process_lead, config: { message: string, pageId: string })
- google-sheets (action: append_row | read_range, config: { spreadsheetId: string, range: string, values: string })
- gmail (action: read_inbox | send_email, config: { query: string, to: string, subject: string, body: string })
- slack (action: post_message, config: { channel: string, message: string })
- discord (action: post_message, config: { channelId: string, message: string })

Output must strictly be a valid JSON object matching:
{
  "name": "Descriptive Workflow Name",
  "description": "Clear explanation of what the workflow accomplishes",
  "tags": ["Tag1", "Tag2"],
  "triggerConfig": { "type": "webhook" | "schedule" | "gmail_trigger" | "manual" },
  "nodes": [
    {
      "id": "node_1",
      "type": "custom",
      "position": { "x": 100, "y": 220 },
      "data": {
        "label": "Human Readable Step Title",
        "category": "trigger" | "ai_agent" | "messaging" | "social" | "integration" | "logic",
        "icon": "Zap" | "Sparkles" | "MessageCircle" | "Send" | "Linkedin" | "Instagram" | "Facebook" | "Table" | "Mail" | "MessageSquare",
        "provider": "webhook" | "ai" | "whatsapp" | "telegram" | "linkedin" | "instagram" | "facebook" | "google-sheets" | "gmail" | "slack" | "discord",
        "action": "receive_webhook" | "ai_process" | "send_message" | "send_alert" | "create_post" | "post_media" | "publish_post" | "append_row" | "send_email" | "post_message",
        "config": { ... }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node_1", "target": "node_2", "animated": true }
  ]
}

Distribute node positions horizontally along the x-axis (e.g. x: 100, x: 420, x: 740, etc.) with y: 220. If multiple branches exist, offset y by +120 or -120.`;

    for (const model of GEMINI_MODELS) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1
            }
          },
          { timeout: 25000 }
        );

        let text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        // Sanitize nodes structure for React Flow
        if (parsed && Array.isArray(parsed.nodes)) {
          parsed.nodes = parsed.nodes.map((node, i) => ({
            id: node.id || `node_${i + 1}`,
            type: 'custom',
            position: node.position || { x: 100 + i * 320, y: 220 },
            data: {
              label: node.data?.label || node.label || `Step ${i + 1}`,
              category: node.data?.category || node.category || 'integration',
              icon: node.data?.icon || (node.data?.provider === 'whatsapp' ? 'MessageCircle' : 'Zap'),
              provider: node.data?.provider || node.provider || 'core',
              action: node.data?.action || node.action || 'execute',
              config: node.data?.config || node.config || {}
            }
          }));
          return parsed;
        }
      } catch (err) {
        console.warn(`Gemini model ${model} failed:`, err.response?.data?.error?.message || err.message);
      }
    }

    throw new Error('All Gemini models failed or timed out');
  }

  async generateWithOpenRouter(prompt) {
    const systemPrompt = `You are an expert Workflow Architect for the RUNA AI Operations Platform.
Output ONLY a valid JSON object representing an executable workflow DAG graph. Format: { name, description, tags, triggerConfig, nodes, edges }. Nodes must have id, type: 'custom', position: {x,y}, data: { label, category, icon, provider, action, config }. Return raw JSON only.`;

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
          'HTTP-Referer': 'https://runa.ai',
          'X-Title': 'RUNA AI'
        },
        timeout: 15000
      }
    );

    let text = response.data.choices[0]?.message?.content || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  }

  buildDeterministicWorkflow(prompt) {
    const p = prompt.toLowerCase();

    // Extract potential phone number
    const phoneMatch = prompt.match(/(\+?\d[\d\s\-]{8,15}\d)/);
    const targetPhone = phoneMatch ? phoneMatch[0].replace(/\s+/g, '') : '+1234567890';

    // 1. WhatsApp & Telegram Specific Pipelines
    if (p.includes('whatsapp') || p.includes('telegram')) {
      const isSheets = p.includes('sheet') || p.includes('excel') || p.includes('table') || p.includes('log');
      const isWhatsApp = p.includes('whatsapp');
      const isTelegram = p.includes('telegram');

      const nodes = [
        {
          id: 'node_1',
          type: 'custom',
          position: { x: 100, y: 220 },
          data: {
            label: 'Inbound Webhook Lead',
            category: 'trigger',
            icon: 'Zap',
            provider: 'webhook',
            action: 'receive_webhook',
            config: { endpoint: '/api/v1/lead-ingestion' }
          }
        },
        {
          id: 'node_2',
          type: 'custom',
          position: { x: 420, y: 220 },
          data: {
            label: 'Gemini Urgency & Lead Analysis Agent',
            category: 'ai_agent',
            icon: 'Sparkles',
            provider: 'ai',
            action: 'ai_process',
            config: {
              prompt: `Analyze the incoming lead payload for urgency, sentiment, and action items: ${prompt}`,
              model: 'auto'
            }
          }
        }
      ];

      const edges = [
        { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true }
      ];

      if (isWhatsApp) {
        nodes.push({
          id: 'node_3',
          type: 'custom',
          position: { x: 740, y: isSheets ? 140 : 220 },
          data: {
            label: 'WhatsApp Direct Alert',
            category: 'messaging',
            icon: 'MessageCircle',
            provider: 'whatsapp',
            action: 'send_message',
            config: {
              to: targetPhone,
              message: '🚨 *RUNA Lead Alert*: High priority lead processed by Gemini AI. {{nodes.node_2.output.content}}'
            }
          }
        });
        edges.push({ id: 'e2-3', source: 'node_2', target: 'node_3', animated: true });
      }

      if (isTelegram && !isWhatsApp) {
        nodes.push({
          id: 'node_3',
          type: 'custom',
          position: { x: 740, y: isSheets ? 140 : 220 },
          data: {
            label: 'Telegram War Room Broadcast',
            category: 'messaging',
            icon: 'Send',
            provider: 'telegram',
            action: 'send_alert',
            config: {
              chatId: '@runa_ops_channel',
              message: '🚨 *RUNA Lead Alert*: {{nodes.node_2.output.content}}'
            }
          }
        });
        edges.push({ id: 'e2-3', source: 'node_2', target: 'node_3', animated: true });
      }

      if (isSheets) {
        const sheetNodeId = nodes.length + 1;
        nodes.push({
          id: `node_${sheetNodeId}`,
          type: 'custom',
          position: { x: 740, y: 320 },
          data: {
            label: 'Google Sheets Audit Record',
            category: 'integration',
            icon: 'Table',
            provider: 'google-sheets',
            action: 'append_row',
            config: {
              spreadsheetId: '1Customer_Leads_2026',
              range: 'Leads!A:E',
              values: '{{nodes.node_1.output.name}}, {{nodes.node_2.output.urgencyScore}}, {{nodes.node_2.output.content}}'
            }
          }
        });
        edges.push({ id: `e2-${sheetNodeId}`, source: 'node_2', target: `node_${sheetNodeId}`, animated: true });
      }

      return {
        name: 'Urgent Lead Ingestion & WhatsApp Dispatch',
        description: `Automated lead triage pipeline: ingests webhook, evaluates priority with Gemini AI, alerts via WhatsApp to ${targetPhone}${isSheets ? ', and records to Google Sheets' : ''}.`,
        tags: ['WhatsApp', 'Gemini AI', isSheets ? 'Google Sheets' : 'Alerts'],
        triggerConfig: { type: 'webhook', webhookPath: '/webhook/lead' },
        nodes,
        edges
      };
    }

    // 2. Social Media Omnichannel Growth (LinkedIn, Instagram, Facebook)
    if (p.includes('linkedin') || p.includes('instagram') || p.includes('facebook') || p.includes('social') || p.includes('post')) {
      return {
        name: 'Omnichannel Social Media AI Publisher (LinkedIn, IG, FB)',
        description: 'Compiles thought leadership & marketing content with Gemini AI, formats tailored captions, and automatically publishes across LinkedIn, Instagram, and Facebook.',
        tags: ['LinkedIn', 'Instagram', 'Facebook', 'AI Marketing'],
        triggerConfig: { type: 'schedule', schedule: '0 10 * * 1-5' },
        nodes: [
          {
            id: 'node_1',
            type: 'custom',
            position: { x: 80, y: 220 },
            data: {
              label: 'Daily Social Cron Trigger',
              category: 'trigger',
              icon: 'Clock',
              provider: 'schedule',
              action: 'cron_trigger',
              config: { cron: '0 10 * * 1-5' }
            }
          },
          {
            id: 'node_2',
            type: 'custom',
            position: { x: 380, y: 220 },
            data: {
              label: 'Gemini Viral Copywriter Agent',
              category: 'ai_agent',
              icon: 'Sparkles',
              provider: 'ai',
              action: 'ai_process',
              config: {
                prompt: 'Draft an engaging thought leadership post about AI operations for LinkedIn, a captivating carousel caption for Instagram, and a concise update for Facebook.',
                model: 'auto'
              }
            }
          },
          {
            id: 'node_3',
            type: 'custom',
            position: { x: 720, y: 120 },
            data: {
              label: 'LinkedIn Post Publisher',
              category: 'social',
              icon: 'Linkedin',
              provider: 'linkedin',
              action: 'create_post',
              config: { text: '{{nodes.node_2.output.content}}', author: 'Executive Profile' }
            }
          },
          {
            id: 'node_4',
            type: 'custom',
            position: { x: 720, y: 240 },
            data: {
              label: 'Instagram Media Dispatch',
              category: 'social',
              icon: 'Instagram',
              provider: 'instagram',
              action: 'post_media',
              config: { caption: '{{nodes.node_2.output.content}} #AI #Automation #RUNA', mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe' }
            }
          },
          {
            id: 'node_5',
            type: 'custom',
            position: { x: 720, y: 360 },
            data: {
              label: 'Facebook Page Broadcast',
              category: 'social',
              icon: 'Facebook',
              provider: 'facebook',
              action: 'publish_post',
              config: { message: '{{nodes.node_2.output.content}}' }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true },
          { id: 'e2-5', source: 'node_2', target: 'node_5', animated: true }
        ]
      };
    }

    // 3. Invoice & Payment Processing
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
              config: { query: 'subject:Invoice OR subject:Bill', maxResults: 5 }
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
              config: { prompt: 'Extract vendor name, invoice number, due date, and total amount as JSON.', model: 'auto' }
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
              config: { spreadsheetId: '1Financial_Operations_Ledger_2026', range: 'Invoices!A:F', values: '{{nodes.node_2.output}}' }
            }
          },
          {
            id: 'node_4',
            type: 'custom',
            position: { x: 740, y: 320 },
            data: {
              label: 'Slack Finance Dispatch',
              category: 'messaging',
              icon: 'MessageSquare',
              provider: 'slack',
              action: 'post_message',
              config: { channel: '#finance-ops', message: '⚡ New Invoice parsed by AI Agent! Total: {{nodes.node_2.output.amount}}' }
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

    // 4. Default Generic Multi-Agent Pipeline
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
            action: 'receive_webhook',
            config: { endpoint: '/api/v1/events' }
          }
        },
        {
          id: 'node_2',
          type: 'custom',
          position: { x: 400, y: 220 },
          data: {
            label: 'AI Reasoning & Transform Agent',
            category: 'ai_agent',
            icon: 'Sparkles',
            provider: 'ai',
            action: 'ai_process',
            config: { prompt: `Execute operational reasoning for: ${prompt}`, model: 'auto' }
          }
        },
        {
          id: 'node_3',
          type: 'custom',
          position: { x: 720, y: 220 },
          data: {
            label: 'Slack Notification Dispatch',
            category: 'messaging',
            icon: 'MessageSquare',
            provider: 'slack',
            action: 'post_message',
            config: { channel: '#operations', message: '🤖 AI Automation Executed: {{nodes.node_2.output.content}}' }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
        { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true }
      ]
    };
  }
}

module.exports = new AIService();
