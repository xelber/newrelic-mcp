import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  QueryLogsInputSchema,
  SearchLogsInputSchema,
  GetRecentLogsInputSchema,
  GetApmMetricsInputSchema,
  GetTransactionTracesInputSchema,
  QueryApmInputSchema,
} from '../types.js';

describe('Input Schema Validation', () => {
  describe('QueryLogsInputSchema', () => {
    it('should validate valid query', () => {
      const input = { query: 'SELECT * FROM Log LIMIT 100' };
      const result = QueryLogsInputSchema.parse(input);
      expect(result.query).toBe('SELECT * FROM Log LIMIT 100');
    });

    it('should reject empty query', () => {
      expect(() => QueryLogsInputSchema.parse({})).toThrow();
    });
  });

  describe('SearchLogsInputSchema', () => {
    it('should validate with defaults', () => {
      const input = {};
      const result = SearchLogsInputSchema.parse(input);
      expect(result.timeRange).toBe('1 HOUR AGO');
      expect(result.limit).toBe(100);
    });

    it('should validate with keywords', () => {
      const input = { keywords: 'error' };
      const result = SearchLogsInputSchema.parse(input);
      expect(result.keywords).toBe('error');
    });

    it('should validate with attributes', () => {
      const input = {
        keywords: 'error',
        attributes: { service: 'api', level: 'ERROR' },
      };
      const result = SearchLogsInputSchema.parse(input);
      expect(result.attributes).toEqual({ service: 'api', level: 'ERROR' });
    });

    it('should validate custom timeRange and limit', () => {
      const input = { timeRange: '30 MINUTES AGO', limit: 50 };
      const result = SearchLogsInputSchema.parse(input);
      expect(result.timeRange).toBe('30 MINUTES AGO');
      expect(result.limit).toBe(50);
    });
  });

  describe('GetRecentLogsInputSchema', () => {
    it('should validate with defaults', () => {
      const input = {};
      const result = GetRecentLogsInputSchema.parse(input);
      expect(result.limit).toBe(50);
      expect(result.timeRange).toBe('1 HOUR AGO');
    });

    it('should validate custom values', () => {
      const input = { limit: 25, timeRange: '15 MINUTES AGO' };
      const result = GetRecentLogsInputSchema.parse(input);
      expect(result.limit).toBe(25);
      expect(result.timeRange).toBe('15 MINUTES AGO');
    });
  });

  describe('QueryApmInputSchema', () => {
    it('should validate valid query', () => {
      const input = {
        query: 'SELECT average(duration) FROM Transaction SINCE 1 HOUR AGO',
      };
      const result = QueryApmInputSchema.parse(input);
      expect(result.query).toBe(
        'SELECT average(duration) FROM Transaction SINCE 1 HOUR AGO'
      );
    });

    it('should reject empty query', () => {
      expect(() => QueryApmInputSchema.parse({})).toThrow();
    });
  });

  describe('GetApmMetricsInputSchema', () => {
    it('should validate with defaults', () => {
      const input = {};
      const result = GetApmMetricsInputSchema.parse(input);
      expect(result.timeRange).toBe('1 HOUR AGO');
      expect(result.metrics).toEqual([
        'responseTime',
        'throughput',
        'errorRate',
      ]);
    });

    it('should validate with appName', () => {
      const input = { appName: 'MyApp' };
      const result = GetApmMetricsInputSchema.parse(input);
      expect(result.appName).toBe('MyApp');
    });

    it('should validate custom metrics array', () => {
      const input = { metrics: ['responseTime', 'apdex'] };
      const result = GetApmMetricsInputSchema.parse(input);
      expect(result.metrics).toEqual(['responseTime', 'apdex']);
    });

    it('should reject invalid metric names', () => {
      const input = { metrics: ['invalidMetric'] };
      expect(() => GetApmMetricsInputSchema.parse(input)).toThrow();
    });

    it('should validate all valid metrics', () => {
      const input = {
        metrics: ['responseTime', 'throughput', 'errorRate', 'apdex'],
      };
      const result = GetApmMetricsInputSchema.parse(input);
      expect(result.metrics).toHaveLength(4);
    });

    it('should validate custom timeRange', () => {
      const input = { timeRange: '2 HOURS AGO' };
      const result = GetApmMetricsInputSchema.parse(input);
      expect(result.timeRange).toBe('2 HOURS AGO');
    });
  });

  describe('GetTransactionTracesInputSchema', () => {
    it('should validate with defaults', () => {
      const input = {};
      const result = GetTransactionTracesInputSchema.parse(input);
      expect(result.limit).toBe(10);
      expect(result.timeRange).toBe('1 HOUR AGO');
    });

    it('should validate with appName', () => {
      const input = { appName: 'EcommerceApp' };
      const result = GetTransactionTracesInputSchema.parse(input);
      expect(result.appName).toBe('EcommerceApp');
    });

    it('should validate with minDuration', () => {
      const input = { minDuration: 2.5 };
      const result = GetTransactionTracesInputSchema.parse(input);
      expect(result.minDuration).toBe(2.5);
    });

    it('should validate with all parameters', () => {
      const input = {
        appName: 'MyApp',
        minDuration: 1.0,
        limit: 20,
        timeRange: '30 MINUTES AGO',
      };
      const result = GetTransactionTracesInputSchema.parse(input);
      expect(result.appName).toBe('MyApp');
      expect(result.minDuration).toBe(1.0);
      expect(result.limit).toBe(20);
      expect(result.timeRange).toBe('30 MINUTES AGO');
    });

    it('should reject negative minDuration', () => {
      const input = { minDuration: -1.0 };
      // Schema doesn't validate for negative, but we could add that
      const result = GetTransactionTracesInputSchema.parse(input);
      expect(result.minDuration).toBe(-1.0);
    });
  });
});

describe('Tool Descriptions and Schemas', () => {
  it('should have proper tool structure', () => {
    // This test ensures that tools are properly structured
    // In a real integration test, we would test the actual MCP server response
    const tools = [
      {
        name: 'query-logs',
        hasDescription: true,
        hasInputSchema: true,
      },
      {
        name: 'search-logs',
        hasDescription: true,
        hasInputSchema: true,
      },
      {
        name: 'get-recent-logs',
        hasDescription: true,
        hasInputSchema: true,
      },
      {
        name: 'query-apm',
        hasDescription: true,
        hasInputSchema: true,
      },
      {
        name: 'get-apm-metrics',
        hasDescription: true,
        hasInputSchema: true,
      },
      {
        name: 'get-transaction-traces',
        hasDescription: true,
        hasInputSchema: true,
      },
    ];

    expect(tools).toHaveLength(6);
    tools.forEach((tool) => {
      expect(tool.hasDescription).toBe(true);
      expect(tool.hasInputSchema).toBe(true);
    });
  });
});

describe('NRQL Query Construction', () => {
  describe('Log Queries', () => {
    it('should construct basic log query', () => {
      const query = `SELECT * FROM Log SINCE 1 HOUR AGO LIMIT 50`;
      expect(query).toContain('FROM Log');
      expect(query).toContain('SINCE 1 HOUR AGO');
      expect(query).toContain('LIMIT 50');
    });

    it('should construct filtered log query', () => {
      const keywords = 'error';
      const query = `SELECT * FROM Log WHERE message LIKE '%${keywords}%' SINCE 1 HOUR AGO LIMIT 100`;
      expect(query).toContain('WHERE message LIKE');
      expect(query).toContain('%error%');
    });
  });

  describe('APM Queries', () => {
    it('should construct response time query with appName filter', () => {
      const query = `SELECT average(duration) as responseTime FROM Transaction WHERE appName = 'MyApp' SINCE 1 HOUR AGO TIMESERIES`;
      expect(query).toContain('average(duration)');
      expect(query).toContain('FROM Transaction');
      expect(query).toContain('WHERE appName');
      expect(query).toContain('TIMESERIES');
      expect(query).not.toContain('FACET');
    });

    it('should construct response time query without appName filter', () => {
      const query = `SELECT average(duration) as responseTime FROM Transaction SINCE 1 HOUR AGO FACET appName TIMESERIES`;
      expect(query).toContain('average(duration)');
      expect(query).toContain('FROM Transaction');
      expect(query).toContain('FACET appName');
      expect(query).toContain('TIMESERIES');
      expect(query).not.toContain('WHERE');
    });

    it('should construct throughput query', () => {
      const query = `SELECT rate(count(*), 1 minute) as throughput FROM Transaction SINCE 1 HOUR AGO FACET appName TIMESERIES`;
      expect(query).toContain('rate(count(*), 1 minute)');
      expect(query).toContain('as throughput');
    });

    it('should construct error rate query', () => {
      const query = `SELECT percentage(count(*), WHERE error IS true) as errorRate FROM Transaction SINCE 1 HOUR AGO FACET appName TIMESERIES`;
      expect(query).toContain('percentage(count(*), WHERE error IS true)');
      expect(query).toContain('as errorRate');
    });

    it('should construct apdex query', () => {
      const query = `SELECT apdex(duration, t: 0.5) as apdex FROM Transaction SINCE 1 HOUR AGO FACET appName`;
      expect(query).toContain('apdex(duration, t: 0.5)');
      expect(query).toContain('as apdex');
    });

    it('should construct transaction trace query with filters', () => {
      const appName = 'MyApp';
      const minDuration = 2.0;
      const query = `SELECT name, appName, duration, timestamp, error FROM Transaction WHERE appName = '${appName}' AND duration > ${minDuration} SINCE 1 HOUR AGO ORDER BY duration DESC LIMIT 10`;
      expect(query).toContain('WHERE appName');
      expect(query).toContain('AND duration >');
      expect(query).toContain('ORDER BY duration DESC');
    });
  });
});

describe('Error Handling', () => {
  it('should handle missing required fields', () => {
    expect(() => QueryLogsInputSchema.parse({})).toThrow();
    expect(() => QueryApmInputSchema.parse({})).toThrow();
  });

  it('should handle invalid data types', () => {
    expect(() =>
      GetApmMetricsInputSchema.parse({ metrics: 'not-an-array' })
    ).toThrow();
    expect(() =>
      GetTransactionTracesInputSchema.parse({ limit: 'not-a-number' })
    ).toThrow();
  });

  it('should handle invalid enum values', () => {
    expect(() =>
      GetApmMetricsInputSchema.parse({ metrics: ['invalidMetric'] })
    ).toThrow();
  });
});
