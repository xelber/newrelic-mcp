#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { NewRelicClient } from './newrelic-client.js';
import {
  ConfigSchema,
  QueryLogsInputSchema,
  SearchLogsInputSchema,
  GetRecentLogsInputSchema,
} from './types.js';

// Load and validate configuration from environment variables
function loadConfig() {
  const config = {
    apiKey: process.env.NEW_RELIC_API_KEY || '',
    accountId: process.env.NEW_RELIC_ACCOUNT_ID || '',
  };

  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    console.error('Configuration error:', error);
    console.error('\nPlease set the following environment variables:');
    console.error('  - NEW_RELIC_API_KEY: Your New Relic User API Key');
    console.error('  - NEW_RELIC_ACCOUNT_ID: Your New Relic Account ID');
    process.exit(1);
  }
}

// Initialize configuration and client
const config = loadConfig();
const newRelicClient = new NewRelicClient(config);

// Create MCP server
const server = new Server(
  {
    name: 'newrelic-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query-logs',
        description:
          'Execute a custom NRQL query against New Relic logs. ' +
          'Use this for complex queries with specific filtering and aggregations. ' +
          'Example: "SELECT * FROM Log WHERE message LIKE \'%error%\' SINCE 1 HOUR AGO LIMIT 100"',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'NRQL query to execute against New Relic logs',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'search-logs',
        description:
          'Search New Relic logs with keyword filtering and optional attributes. ' +
          'This is a simpler alternative to query-logs for basic searches.',
        inputSchema: {
          type: 'object',
          properties: {
            keywords: {
              type: 'string',
              description: 'Keywords to search for in log messages',
            },
            timeRange: {
              type: 'string',
              description: 'Time range (e.g., "1 HOUR AGO", "30 MINUTES AGO", "1 DAY AGO")',
              default: '1 HOUR AGO',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 100,
            },
            attributes: {
              type: 'object',
              description: 'Additional attributes to filter by (key-value pairs)',
              additionalProperties: { type: 'string' },
            },
          },
        },
      },
      {
        name: 'get-recent-logs',
        description:
          'Get the most recent log entries from New Relic. ' +
          'Useful for quickly checking the latest logs without specific filters.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of recent log entries to retrieve',
              default: 50,
            },
            timeRange: {
              type: 'string',
              description: 'Time range to search within',
              default: '1 HOUR AGO',
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query-logs': {
        const { query } = QueryLogsInputSchema.parse(args);
        const results = await newRelicClient.queryLogs(query);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'search-logs': {
        const { keywords, timeRange, limit, attributes } = SearchLogsInputSchema.parse(args);
        const results = await newRelicClient.searchLogs(keywords, timeRange, limit, attributes);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'get-recent-logs': {
        const { limit, timeRange } = GetRecentLogsInputSchema.parse(args);
        const results = await newRelicClient.getRecentLogs(limit, timeRange);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('New Relic MCP Server running on stdio');
  console.error(`Account ID: ${config.accountId}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
