/**
 * Mesh Connect API Client
 * Documentation: https://docs.meshconnect.com/api-reference/
 */

const https = require('https');
const http = require('http');

class MeshClient {
  constructor(config = {}) {
    this.clientId = config.clientId || process.env.MESH_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.MESH_CLIENT_SECRET;
    this.apiUrl = config.apiUrl || process.env.MESH_API_URL || 'https://integration-api.meshconnect.com';

    if (!this.clientId || !this.clientSecret) {
      console.warn('Warning: Mesh Client ID or Secret not configured');
    }
  }

  /**
   * Make a request to Mesh API
   * @private
   */
  async _request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.apiUrl);
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      // Prepare authentication
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
      };

      if (data) {
        const bodyData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(bodyData);
      }

      const req = httpModule.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {};

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              reject({
                statusCode: res.statusCode,
                message: parsedData.message || parsedData.error || 'Request failed',
                data: parsedData,
              });
            }
          } catch (error) {
            reject({
              statusCode: res.statusCode,
              message: 'Failed to parse response',
              error: error.message,
              rawData: responseData,
            });
          }
        });
      });

      req.on('error', (error) => {
        reject({
          message: 'Network error',
          error: error.message,
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Create a Link Token
   * Used to initialize the Mesh Connect SDK
   * @param {Object} params - Link token parameters
   * @param {string} params.userId - Unique identifier for the user
   * @returns {Promise<Object>} - Link token response
   */
  async createLinkToken(params = {}) {
    const { userId } = params;

    const payload = {
      userId: userId || `user_${Date.now()}`,
    };

    try {
      const response = await this._request('POST', '/api/v1/linktoken', payload);
      return response;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw error;
    }
  }

  /**
   * Get Authentication Token
   * Retrieve auth token for a connected account
   * @param {string} accountId - The account ID from onIntegrationConnected
   * @returns {Promise<Object>} - Authentication token details
   */
  async getAuthToken(accountId) {
    try {
      const response = await this._request('GET', `/api/v1/auth/${accountId}`);
      return response;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }

  /**
   * Get Account Holdings
   * Retrieve holdings/balances for a connected account
   * @param {string} accountId - The account ID
   * @returns {Promise<Object>} - Account holdings
   */
  async getHoldings(accountId) {
    try {
      const response = await this._request('GET', `/api/v1/holdings/${accountId}`);
      return response;
    } catch (error) {
      console.error('Error getting holdings:', error);
      throw error;
    }
  }

  /**
   * Get Transactions
   * Retrieve transaction history for a connected account
   * @param {string} accountId - The account ID
   * @returns {Promise<Object>} - Transaction history
   */
  async getTransactions(accountId) {
    try {
      const response = await this._request('GET', `/api/v1/transactions/${accountId}`);
      return response;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  /**
   * Create Transfer Preview
   * Preview a transfer before executing
   * @param {Object} params - Transfer parameters
   * @returns {Promise<Object>} - Transfer preview
   */
  async createTransferPreview(params) {
    try {
      const response = await this._request('POST', '/api/v1/transfers/preview', params);
      return response;
    } catch (error) {
      console.error('Error creating transfer preview:', error);
      throw error;
    }
  }

  /**
   * Execute Transfer
   * Execute a crypto transfer
   * @param {Object} params - Transfer parameters
   * @returns {Promise<Object>} - Transfer result
   */
  async executeTransfer(params) {
    try {
      const response = await this._request('POST', '/api/v1/transfers', params);
      return response;
    } catch (error) {
      console.error('Error executing transfer:', error);
      throw error;
    }
  }

  /**
   * Get Transfer Status
   * Check the status of a transfer
   * @param {string} transferId - The transfer ID
   * @returns {Promise<Object>} - Transfer status
   */
  async getTransferStatus(transferId) {
    try {
      const response = await this._request('GET', `/api/v1/transfers/${transferId}`);
      return response;
    } catch (error) {
      console.error('Error getting transfer status:', error);
      throw error;
    }
  }

  /**
   * Disconnect Account
   * Disconnect a user's connected account
   * @param {string} accountId - The account ID to disconnect
   * @returns {Promise<Object>} - Disconnect result
   */
  async disconnectAccount(accountId) {
    try {
      const response = await this._request('DELETE', `/api/v1/auth/${accountId}`);
      return response;
    } catch (error) {
      console.error('Error disconnecting account:', error);
      throw error;
    }
  }
}

module.exports = MeshClient;
