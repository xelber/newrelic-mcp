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
