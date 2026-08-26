const BaseIntegration = require('./baseIntegration');
const axios = require('axios');
const env = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  async getAuthUrl(state) {
    if (!env.GOOGLE_SHEETS_CLIENT_ID) {
      return `${env.GOOGLE_SHEETS_REDIRECT_URI}?code=mock_sheets_code_sandbox&state=${state}`;
    }
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_SHEETS_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GOOGLE_SHEETS_REDIRECT_URI)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`;
  }

  async exchangeCodeForTokens(code) {
    if (code === 'mock_sheets_code_sandbox' || !env.GOOGLE_SHEETS_CLIENT_ID) {
      return {
        accessToken: 'mock_sheets_access_token_' + Date.now(),
        refreshToken: 'mock_sheets_refresh_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 3600 * 1000),
        scopes: ['spreadsheets'],
        accountEmail: 'operator@agentflow.ai',
        accountName: 'Google Sheets Sandbox'
      };
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: env.GOOGLE_SHEETS_CLIENT_ID,
      client_secret: env.GOOGLE_SHEETS_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_SHEETS_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const data = response.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
      scopes: ['spreadsheets'],
      accountEmail: 'sheets-user@connected.com'
    };
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { success: false, message: 'No credentials provided for Google Sheets.' };
    }
    if (credentials.accessToken.startsWith('mock_')) {
      return { success: true, message: 'Google Sheets sandbox connected.', account: 'operator@agentflow.ai' };
    }

    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` }
      });
      return { success: true, message: 'Google Sheets connected', account: res.data.email };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async executeAction(action, params, credentials) {
    const isMock = !credentials || !credentials.accessToken || credentials.accessToken.startsWith('mock_');

    switch (action) {
      case 'append_row': {
        const { spreadsheetId = '1MockSheetID_Operations_2026', range = 'Sheet1!A:Z', values = [] } = params;

        let rowValues = values;
        if (typeof values === 'string') {
          try {
            rowValues = JSON.parse(values);
          } catch (e) {
            rowValues = values.split(',').map(v => v.trim());
          }
        }
        if (!Array.isArray(rowValues)) {
          rowValues = [rowValues];
        }

        if (isMock) {
          return {
            status: 'appended',
            spreadsheetId,
            tableRange: range,
            updates: {
              updatedRange: `${range.split('!')[0]}!A10:E10`,
              updatedRows: 1,
              updatedColumns: rowValues.length,
              updatedCells: rowValues.length
            },
            appendedData: rowValues,
            timestamp: new Date().toISOString(),
            mode: 'sandbox'
          };
        }

        const res = await axios.post(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
          { values: [rowValues] },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          status: 'appended',
          spreadsheetId,
          updates: res.data.updates,
          appendedData: rowValues
        };
      }

      case 'read_range': {
        const { spreadsheetId = '1MockSheetID_Operations_2026', range = 'Sheet1!A1:E10' } = params;

        if (isMock) {
          return {
            spreadsheetId,
            range,
            values: [
              ['Timestamp', 'Event Type', 'Source', 'Payload', 'Status'],
              [new Date().toISOString(), 'INVOICE_PROCESSED', 'Stripe', '$4,950.00', 'SUCCESS'],
              [new Date(Date.now() - 3600000).toISOString(), 'ALERT_DISPATCHED', 'Gmail', 'Server CPU > 90%', 'RESOLVED']
            ],
            mode: 'sandbox'
          };
        }

        const res = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          spreadsheetId,
          range: res.data.range,
          values: res.data.values || []
        };
      }

      default:
        throw new Error(`Unsupported Google Sheets action: ${action}`);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
