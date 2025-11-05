import { z } from 'zod';

// Configuration schema
export const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'NEW_RELIC_API_KEY is required'),
  accountId: z.string().min(1, 'NEW_RELIC_ACCOUNT_ID is required'),
});

export type Config = z.infer<typeof ConfigSchema>;

// Tool input schemas
export const QueryLogsInputSchema = z.object({
  query: z.string().describe('NRQL query to execute (e.g., "SELECT * FROM Log WHERE message LIKE \'%error%\' SINCE 1 HOUR AGO")'),
});

export const SearchLogsInputSchema = z.object({
  keywords: z.string().optional().describe('Keywords to search for in log messages'),
  timeRange: z.string().default('1 HOUR AGO').describe('Time range (e.g., "1 HOUR AGO", "30 MINUTES AGO", "1 DAY AGO")'),
  limit: z.number().default(100).describe('Maximum number of results to return'),
  attributes: z.record(z.string()).optional().describe('Additional attributes to filter by (key-value pairs)'),
});

export const GetRecentLogsInputSchema = z.object({
  limit: z.number().default(50).describe('Number of recent log entries to retrieve'),
  timeRange: z.string().default('1 HOUR AGO').describe('Time range to search within'),
});

// APM Tool input schemas
export const GetApmMetricsInputSchema = z.object({
  appName: z.string().optional().describe('Application name to filter metrics (optional)'),
  timeRange: z.string().default('1 HOUR AGO').describe('Time range (e.g., "1 HOUR AGO", "30 MINUTES AGO", "1 DAY AGO")'),
  metrics: z.array(z.enum(['responseTime', 'throughput', 'errorRate', 'apdex'])).default(['responseTime', 'throughput', 'errorRate']).describe('Metrics to retrieve'),
});

export const GetTransactionTracesInputSchema = z.object({
  appName: z.string().optional().describe('Application name to filter transactions'),
  minDuration: z.number().optional().describe('Minimum transaction duration in seconds to filter slow transactions'),
  limit: z.number().default(10).describe('Maximum number of transaction traces to return'),
  timeRange: z.string().default('1 HOUR AGO').describe('Time range to search within'),
});

export const QueryApmInputSchema = z.object({
  query: z.string().describe('NRQL query to execute against APM data (e.g., "SELECT average(duration) FROM Transaction WHERE appName = \'MyApp\' SINCE 1 HOUR AGO")'),
});

// New Relic API types
export interface NerdGraphResponse {
  data?: {
    actor?: {
      account?: {
        nrql?: {
          results: any[];
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    extensions?: {
      errorClass?: string;
    };
  }>;
}

export interface LogEntry {
  timestamp?: number;
  message?: string;
  level?: string;
  [key: string]: any;
}

export interface ApmMetrics {
  appName?: string;
  responseTime?: number;
  throughput?: number;
  errorRate?: number;
  apdex?: number;
  timestamp?: number;
  [key: string]: any;
}

export interface TransactionTrace {
  name?: string;
  appName?: string;
  duration?: number;
  timestamp?: number;
  error?: boolean;
  [key: string]: any;
}
