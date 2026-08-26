const axios = require('axios');
const env = require('./src/config/env');

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest'
];

async function testPrompt() {
  const prompt = 'When a high-priority customer lead is received on webhook, analyze urgency with Gemini AI, send a WhatsApp alert to +91 9345288285, and log row to Google Sheets';

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
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Human Readable Step Title",
        "category": "trigger" | "ai_agent" | "messaging" | "social" | "integration" | "logic",
        "icon": "Zap" | "Sparkles" | "MessageCircle" | "Send" | "Linkedin" | "Instagram" | "Facebook" | "Table" | "Mail" | "MessageSquare",
        "provider": "webhook" | "ai" | "whatsapp" | "telegram" | "linkedin" | "instagram" | "facebook" | "google-sheets" | "gmail" | "slack",
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

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}...`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.1
          }
        },
        { timeout: 20000 }
      );

      const text = res.data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text);
      console.log(`✅ SUCCESS with model ${model}! Workflow Name:`, parsed.name);
      console.log('Nodes generated:');
      parsed.nodes.forEach((n, i) => {
        console.log(` ${i + 1}. ${n.data.label} [Provider: ${n.data.provider}, Action: ${n.data.action}]`);
        console.log(`    Config:`, JSON.stringify(n.data.config));
      });
      return parsed;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }
}

testPrompt();
