export const NODE_CATEGORIES = {
  TRIGGERS: 'triggers',
  AI_AGENTS: 'ai_agents',
  INTEGRATIONS: 'integrations',
  LOGIC: 'logic'
};

export const AVAILABLE_NODES = [
  // TRIGGERS
  {
    type: 'gmail_trigger',
    label: 'Gmail Inbound Trigger',
    category: NODE_CATEGORIES.TRIGGERS,
    provider: 'gmail',
    action: 'read_inbox',
    icon: 'Mail',
    color: 'emerald',
    description: 'Triggers workflow when new email matching query arrives',
    defaultConfig: {
      query: 'is:unread label:important',
      maxResults: 5
    }
  },
  {
    type: 'webhook_trigger',
    label: 'Webhook Trigger',
    category: NODE_CATEGORIES.TRIGGERS,
    provider: 'webhook',
    action: 'manual_trigger',
    icon: 'Zap',
    color: 'amber',
    description: 'Triggers on incoming HTTP JSON payload',
    defaultConfig: {
      endpoint: '/api/v1/webhook/events'
    }
  },
  {
    type: 'schedule_trigger',
    label: 'Schedule / Cron Trigger',
    category: NODE_CATEGORIES.TRIGGERS,
    provider: 'schedule',
    action: 'cron_tick',
    icon: 'Clock',
    color: 'blue',
    description: 'Executes automation on recurring cron schedule',
    defaultConfig: {
      schedule: '0 9 * * 1-5'
    }
  },

  // AI AGENTS
  {
    type: 'ai_reasoning',
    label: 'AI Reasoning & Transform',
    category: NODE_CATEGORIES.AI_AGENTS,
    provider: 'ai',
    action: 'ai_process',
    icon: 'Sparkles',
    color: 'violet',
    description: 'Multi-agent LLM reasoning (OpenRouter / Gemini / Heuristic)',
    defaultConfig: {
      prompt: 'Analyze input data, classify severity, and extract key attributes as structured JSON.',
      model: 'auto',
      temperature: 0.2
    }
  },
  {
    type: 'ai_summarizer',
    label: 'AI Executive Summarizer',
    category: NODE_CATEGORIES.AI_AGENTS,
    provider: 'ai',
    action: 'summarize',
    icon: 'Cpu',
    color: 'violet',
    description: 'Condenses raw logs, customer tickets, or email threads',
    defaultConfig: {
      prompt: 'Summarize the top 3 actionable points into concise bullet points.',
      model: 'auto'
    }
  },
  {
    type: 'ai_sentiment',
    label: 'AI Sentiment & Severity',
    category: NODE_CATEGORIES.AI_AGENTS,
    provider: 'ai',
    action: 'sentiment_analysis',
    icon: 'ShieldAlert',
    color: 'violet',
    description: 'Detects customer frustration and urgency scores',
    defaultConfig: {
      prompt: 'Evaluate urgency and satisfaction sentiment score between 0.0 and 1.0.',
      model: 'auto'
    }
  },

  // INTEGRATIONS
  {
    type: 'slack_message',
    label: 'Slack Notification',
    category: NODE_CATEGORIES.INTEGRATIONS,
    provider: 'slack',
    action: 'post_message',
    icon: 'MessageSquare',
    color: 'cyan',
    description: 'Broadcasts formatted messages or rich blocks to Slack channels',
    defaultConfig: {
      channel: '#operations',
      message: '⚡ AI Agent executed automation: {{nodes.node_2.output.content}}'
    }
  },
  {
    type: 'discord_message',
    label: 'Discord Alert & Embed',
    category: NODE_CATEGORIES.INTEGRATIONS,
    provider: 'discord',
    action: 'post_message',
    icon: 'Bot',
    color: 'indigo',
    description: 'Dispatches rich webhook embeds and announcements to Discord',
    defaultConfig: {
      channelId: 'ops-alerts',
      title: '🚨 Agentflow System Alert',
      message: 'Workflow step completed successfully.'
    }
  },
  {
    type: 'google_sheets_append',
    label: 'Google Sheets Append',
    category: NODE_CATEGORIES.INTEGRATIONS,
    provider: 'google-sheets',
    action: 'append_row',
    icon: 'Table',
    color: 'emerald',
    description: 'Appends structured data rows to a Google Spreadsheet ledger',
    defaultConfig: {
      spreadsheetId: '1Financial_Operations_Ledger_2026',
      range: 'Sheet1!A:E',
      values: '{{nodes.node_1.output.timestamp}}, {{nodes.node_2.output.content}}, SUCCESS'
    }
  },
  {
    type: 'gmail_send',
    label: 'Send Gmail Email',
    category: NODE_CATEGORIES.INTEGRATIONS,
    provider: 'gmail',
    action: 'send_email',
    icon: 'Send',
    color: 'rose',
    description: 'Sends automated outbound HTML or plain emails via Gmail OAuth',
    defaultConfig: {
      to: 'team@acme.com',
      subject: 'Automated Operations Notification: {{nodes.node_2.output.category}}',
      body: 'Hello Team,\n\nThe AI Agentic Workflow has processed the item successfully.\n\nSummary:\n{{nodes.node_2.output.content}}'
    }
  }
];
