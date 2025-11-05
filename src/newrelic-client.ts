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
   * Query APM data with custom NRQL
   */
  async queryApm(nrqlQuery: string): Promise<any[]> {
    return this.executeNRQL(nrqlQuery);
  }

  /**
   * Get APM metrics for applications
   */
  async getApmMetrics(
    appName?: string,
    timeRange: string = '1 HOUR AGO',
    metrics: string[] = ['responseTime', 'throughput', 'errorRate']
  ): Promise<any[]> {
    const results: any[] = [];

    // Build queries for each requested metric
    for (const metric of metrics) {
      let query = '';

      // When filtering by appName, use WHERE clause; otherwise FACET by appName
      if (appName) {
        const escapedAppName = this.escapeLike(appName);
        switch (metric) {
          case 'responseTime':
            query = `SELECT average(duration) as responseTime FROM Transaction WHERE appName = '${escapedAppName}' SINCE ${timeRange} TIMESERIES`;
            break;
          case 'throughput':
            query = `SELECT rate(count(*), 1 minute) as throughput FROM Transaction WHERE appName = '${escapedAppName}' SINCE ${timeRange} TIMESERIES`;
            break;
          case 'errorRate':
            query = `SELECT percentage(count(*), WHERE error IS true) as errorRate FROM Transaction WHERE appName = '${escapedAppName}' SINCE ${timeRange} TIMESERIES`;
            break;
          case 'apdex':
            query = `SELECT apdex(duration, t: 0.5) as apdex FROM Transaction WHERE appName = '${escapedAppName}' SINCE ${timeRange}`;
            break;
          default:
            continue;
        }
      } else {
        // No app filter - get metrics for all apps using FACET
        switch (metric) {
          case 'responseTime':
            query = `SELECT average(duration) as responseTime FROM Transaction SINCE ${timeRange} FACET appName TIMESERIES`;
            break;
          case 'throughput':
            query = `SELECT rate(count(*), 1 minute) as throughput FROM Transaction SINCE ${timeRange} FACET appName TIMESERIES`;
            break;
          case 'errorRate':
            query = `SELECT percentage(count(*), WHERE error IS true) as errorRate FROM Transaction SINCE ${timeRange} FACET appName TIMESERIES`;
            break;
          case 'apdex':
            query = `SELECT apdex(duration, t: 0.5) as apdex FROM Transaction SINCE ${timeRange} FACET appName`;
            break;
          default:
            continue;
        }
      }

      try {
        const metricResults = await this.executeNRQL(query);
        results.push({
          metric,
          data: metricResults,
        });
      } catch (error) {
        // Continue with other metrics if one fails
        results.push({
          metric,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get transaction traces (slow or all transactions)
   */
  async getTransactionTraces(
    appName?: string,
    minDuration?: number,
    limit: number = 10,
    timeRange: string = '1 HOUR AGO'
  ): Promise<any[]> {
    const conditions: string[] = [];

    if (appName) {
      conditions.push(`appName = '${this.escapeLike(appName)}'`);
    }

    if (minDuration !== undefined) {
      conditions.push(`duration > ${minDuration}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')} ` : '';
    const query = `SELECT name, appName, duration, timestamp, error FROM Transaction ${whereClause}SINCE ${timeRange} ORDER BY duration DESC LIMIT ${limit}`;

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
