import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { NewRelicClient } from '../newrelic-client.js';
import type { Config } from '../types.js';

describe('NewRelicClient', () => {
  let client: NewRelicClient;
  let mock: MockAdapter;
  const config: Config = {
    apiKey: 'test-api-key',
    accountId: '12345',
  };

  beforeEach(() => {
    // Mock axios before creating the client
    mock = new MockAdapter(axios);
    client = new NewRelicClient(config);
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
  });

  describe('executeNRQL', () => {
    it('should execute NRQL query successfully', async () => {
      const mockResults = [{ message: 'test log', timestamp: 123456 }];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.queryLogs('SELECT * FROM Log LIMIT 1');
      expect(results).toEqual(mockResults);
    });

    it('should handle NerdGraph errors', async () => {
      const mockResponse = {
        errors: [
          {
            message: 'Invalid query',
            extensions: { errorClass: 'VALIDATION_ERROR' },
          },
        ],
      };

      mock.onPost('').reply(200, mockResponse);

      await expect(client.queryLogs('INVALID QUERY')).rejects.toThrow(
        'NerdGraph errors: Invalid query'
      );
    });

    it('should handle network errors', async () => {
      mock.onPost('').networkError();

      await expect(client.queryLogs('SELECT * FROM Log')).rejects.toThrow(
        'Failed to query New Relic'
      );
    });
  });

  describe('searchLogs', () => {
    it('should search logs with keywords', async () => {
      const mockResults = [{ message: 'error occurred', level: 'ERROR' }];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.searchLogs('error', '1 HOUR AGO', 100);
      expect(results).toEqual(mockResults);
    });

    it('should search logs with attributes', async () => {
      const mockResults = [{ message: 'test', service: 'api' }];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.searchLogs(undefined, '1 HOUR AGO', 100, {
        service: 'api',
      });
      expect(results).toEqual(mockResults);
    });
  });

  describe('getRecentLogs', () => {
    it('should get recent logs', async () => {
      const mockResults = [{ message: 'recent log' }];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getRecentLogs(50, '1 HOUR AGO');
      expect(results).toEqual(mockResults);
    });
  });

  describe('queryApm', () => {
    it('should execute APM query successfully', async () => {
      const mockResults = [{ appName: 'MyApp', 'average(duration)': 0.5 }];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.queryApm(
        'SELECT average(duration) FROM Transaction WHERE appName = "MyApp"'
      );
      expect(results).toEqual(mockResults);
    });
  });

  describe('getApmMetrics', () => {
    it('should get response time metrics', async () => {
      const mockResults = [{ appName: 'MyApp', responseTime: 0.5 }];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getApmMetrics(undefined, '1 HOUR AGO', [
        'responseTime',
      ]);
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('metric', 'responseTime');
      expect(results[0]).toHaveProperty('data', mockResults);
    });

    it('should get multiple metrics', async () => {
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: [{ appName: 'MyApp', value: 100 }],
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getApmMetrics('MyApp', '1 HOUR AGO', [
        'responseTime',
        'throughput',
        'errorRate',
      ]);
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.metric)).toEqual([
        'responseTime',
        'throughput',
        'errorRate',
      ]);
    });

    it('should handle individual metric errors gracefully', async () => {
      mock
        .onPost('')
        .replyOnce(200, {
          data: {
            actor: {
              account: {
                nrql: {
                  results: [{ appName: 'MyApp', responseTime: 0.5 }],
                },
              },
            },
          },
        })
        .onPost('')
        .replyOnce(200, {
          errors: [{ message: 'Invalid metric query' }],
        });

      const results = await client.getApmMetrics(undefined, '1 HOUR AGO', [
        'responseTime',
        'throughput',
      ]);
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('metric', 'responseTime');
      expect(results[1]).toHaveProperty('metric', 'throughput');
      expect(results[1]).toHaveProperty('error');
    });

    it('should filter by appName', async () => {
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: [{ appName: 'SpecificApp', responseTime: 0.3 }],
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getApmMetrics('SpecificApp', '1 HOUR AGO', [
        'responseTime',
      ]);
      expect(results[0].data).toEqual([
        { appName: 'SpecificApp', responseTime: 0.3 },
      ]);
    });
  });

  describe('getTransactionTraces', () => {
    it('should get transaction traces', async () => {
      const mockResults = [
        {
          name: '/api/users',
          appName: 'MyApp',
          duration: 1.5,
          timestamp: 123456,
          error: false,
        },
      ];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getTransactionTraces(
        undefined,
        undefined,
        10,
        '1 HOUR AGO'
      );
      expect(results).toEqual(mockResults);
    });

    it('should filter by appName', async () => {
      const mockResults = [
        {
          name: '/api/orders',
          appName: 'EcommerceApp',
          duration: 2.0,
          timestamp: 123457,
          error: false,
        },
      ];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getTransactionTraces(
        'EcommerceApp',
        undefined,
        10,
        '1 HOUR AGO'
      );
      expect(results).toEqual(mockResults);
    });

    it('should filter by minDuration', async () => {
      const mockResults = [
        {
          name: '/api/slow-endpoint',
          appName: 'MyApp',
          duration: 5.0,
          timestamp: 123458,
          error: false,
        },
      ];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getTransactionTraces(
        undefined,
        3.0,
        10,
        '1 HOUR AGO'
      );
      expect(results).toEqual(mockResults);
    });

    it('should filter by both appName and minDuration', async () => {
      const mockResults = [
        {
          name: '/api/complex-query',
          appName: 'DatabaseApp',
          duration: 4.5,
          timestamp: 123459,
          error: false,
        },
      ];
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: mockResults,
              },
            },
          },
        },
      };

      mock.onPost('').reply(200, mockResponse);

      const results = await client.getTransactionTraces(
        'DatabaseApp',
        2.0,
        5,
        '30 MINUTES AGO'
      );
      expect(results).toEqual(mockResults);
    });
  });

  describe('escaping', () => {
    it('should escape quotes in queries', async () => {
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: [],
              },
            },
          },
        },
      };

      mock.onPost('').reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.query).toContain('\\"test\\"');
        return [200, mockResponse];
      });

      await client.queryLogs('SELECT * FROM Log WHERE message = "test"');
    });

    it('should escape special characters in LIKE clauses', async () => {
      const mockResponse = {
        data: {
          actor: {
            account: {
              nrql: {
                results: [],
              },
            },
          },
        },
      };

      mock.onPost('').reply((config) => {
        const body = JSON.parse(config.data);
        // Should escape single quotes and percent signs
        expect(body.query).not.toContain("it's");
        expect(body.query).toContain("\\'");
        return [200, mockResponse];
      });

      await client.searchLogs("it's 100%", '1 HOUR AGO', 10);
    });
  });
});
