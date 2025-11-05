# Enhancement: Add Enhanced Error Analytics Tools

## Description
Add specialized tools for error investigation beyond basic log search, providing structured error data analysis and root cause identification capabilities.

## Proposed Tools

### 1. `get-error-analytics`
Get error rates, distributions, and trends over time.

**Parameters:**
- `appName` (optional): Filter by application
- `timeRange` (default: "1 HOUR AGO"): Time range for analysis
- `groupBy` (optional): Group errors by attribute (error.class, transaction.name, etc.)

**Example:**
```
get-error-analytics with appName: "MyApp", timeRange: "24 HOURS AGO", groupBy: "error.class"
```

### 2. `get-error-traces`
Retrieve error stack traces and detailed error information.

**Parameters:**
- `appName` (optional): Filter by application
- `errorClass` (optional): Filter by specific error class
- `limit` (default: 20): Maximum number of error traces
- `timeRange` (default: "1 HOUR AGO"): Time window

**Example:**
```
get-error-traces with appName: "API", errorClass: "DatabaseConnectionError", limit: 10
```

### 3. `analyze-error-patterns`
Group and classify errors to identify root causes.

**Parameters:**
- `appName` (optional): Filter by application
- `timeRange` (default: "1 DAY AGO"): Analysis time range
- `minOccurrences` (default: 5): Minimum error count to include

**Example:**
```
analyze-error-patterns with appName: "MyApp", timeRange: "7 DAYS AGO", minOccurrences: 10
```

## Value Proposition

✅ **Faster root cause identification** - Structured error data vs. raw logs
✅ **Error classification** - Automatically group similar errors
✅ **Trend analysis** - Identify error rate changes and spikes
✅ **Stack trace access** - Direct access to error details for debugging

## Implementation Notes

- Use `TransactionError` event type from New Relic APM
- Leverage NRQL for aggregations and grouping
- Consider using Error Analytics API if available
- May overlap with logs - focus on structured error data

## Example NRQL Queries

**Error rate by class:**
```sql
SELECT count(*) FROM TransactionError
WHERE appName = 'MyApp'
FACET error.class
SINCE 1 HOUR AGO
```

**Error traces with details:**
```sql
SELECT error.class, error.message, error.expected, transaction.name
FROM TransactionError
WHERE appName = 'MyApp'
LIMIT 20
SINCE 1 HOUR AGO
```

**Error trends:**
```sql
SELECT count(*) FROM TransactionError
WHERE appName = 'MyApp'
SINCE 1 DAY AGO
TIMESERIES
```

## Example Use Cases

- "What are the most common errors in MyApp over the last 24 hours?"
- "Show me all DatabaseConnectionError traces from today"
- "Has the error rate increased after the latest deployment?"
- "Find errors that only started appearing in the last hour"
- "Group errors by transaction to find problematic endpoints"

## Priority
**Medium** - Useful for debugging, but logs already provide some coverage

## Labels
`enhancement`, `feature-request`, `error-analytics`, `debugging`
