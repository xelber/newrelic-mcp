import axios, { AxiosInstance } from 'axios';
import type { Config, NerdGraphResponse } from './types.js';

export class NewRelicClient {
  private client: AxiosInstance;
  private accountId: string;

  constructor(config: Config) {
    this.accountId = config.accountId;
    this.client = axios.create({
      baseURL: 'https://api.newrelic.com/graphql',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': config.apiKey,
      },
    });
  }

  /**
   * Execute an NRQL query against New Relic
   */
  async executeNRQL(query: string): Promise<any[]> {
    const graphqlQuery = `
      {
        actor {
          account(id: ${this.accountId}) {
            nrql(query: "${this.escapeQuery(query)}") {
              results
            }
          }
        }
      }
    `;

    try {
      const response = await this.client.post<NerdGraphResponse>('', {
        query: graphqlQuery,
      });

      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors
          .map(err => err.message)
          .join(', ');
        throw new Error(`NerdGraph errors: ${errorMessages}`);
      }

      return response.data.data?.actor?.account?.nrql?.results || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to query New Relic: ${error.message}${
            error.response?.data ? ` - ${JSON.stringify(error.response.data)}` : ''
          }`
        );
      }
      throw error;
    }
  }

  /**
   * Query logs with custom NRQL
   */
  async queryLogs(nrqlQuery: string): Promise<any[]> {
    return this.executeNRQL(nrqlQuery);
  }

  /**
   * Search logs with filters
   */
  async searchLogs(
    keywords?: string,
    timeRange: string = '1 HOUR AGO',
    limit: number = 100,
    attributes?: Record<string, string>
  ): Promise<any[]> {
    let whereClause = '';
    const conditions: string[] = [];

    if (keywords) {
      conditions.push(`message LIKE '%${this.escapeLike(keywords)}%'`);
    }

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        conditions.push(`${key} = '${this.escapeLike(value)}'`);
      }
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')} `;
    }

    const query = `SELECT * FROM Log ${whereClause}SINCE ${timeRange} LIMIT ${limit}`;
    return this.executeNRQL(query);
  }

  /**
   * Get recent log entries
   */
  async getRecentLogs(limit: number = 50, timeRange: string = '1 HOUR AGO'): Promise<any[]> {
    const query = `SELECT * FROM Log SINCE ${timeRange} LIMIT ${limit}`;
    return this.executeNRQL(query);
  }

  /**
   * Escape quotes in NRQL queries
   */
  private escapeQuery(query: string): string {
    return query.replace(/"/g, '\\"');
  }

  /**
   * Escape special characters in LIKE clauses
   */
  private escapeLike(value: string): string {
    return value.replace(/'/g, "\\'").replace(/%/g, '\\%');
  }
}
