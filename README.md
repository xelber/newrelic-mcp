# New Relic MCP Server

A Model Context Protocol (MCP) server that provides AI agents like Claude Code with access to New Relic logs and APM data through the NerdGraph API.

## Features

### Log Tools
- **query-logs**: Execute custom NRQL queries against New Relic logs
- **search-logs**: Search logs with keyword filtering and optional attributes
- **get-recent-logs**: Retrieve the most recent log entries

### APM Tools
- **query-apm**: Execute custom NRQL queries against APM data (transactions, metrics, etc.)
- **get-apm-metrics**: Get application performance metrics (response time, throughput, error rate, Apdex)
- **get-transaction-traces**: Retrieve transaction traces with optional filtering for slow transactions

## Prerequisites

- Node.js 18 or higher
- New Relic account with:
  - User API Key ([create one here](https://one.newrelic.com/api-keys))
  - Account ID ([find it here](https://one.newrelic.com/admin-portal))

## Installation

1. Clone this repository:

```bash
git clone https://github.com/xelber/newrelic-mcp.git
cd newrelic-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## Configuration

Set the following environment variables:

```bash
export NEW_RELIC_API_KEY="your-user-api-key"
export NEW_RELIC_ACCOUNT_ID="your-account-id"
```

Or create a `.env` file in the project root (not committed to git):

```env
NEW_RELIC_API_KEY=your-user-api-key
NEW_RELIC_ACCOUNT_ID=your-account-id
```

## Usage with Claude Desktop and Claude Code

### Step 1: Configure in Claude Desktop

First, add this server to your Claude Desktop configuration file:

**Configuration file location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Add the following configuration:**

```json
{
  "mcpServers": {
    "newrelic": {
      "command": "node",
      "args": ["/absolute/path/to/newrelic-mcp/dist/index.js"],
      "env": {
        "NEW_RELIC_API_KEY": "your-user-api-key",
        "NEW_RELIC_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

**Important:**
- Replace `/absolute/path/to/newrelic-mcp` with the actual path to this project
- Replace `your-user-api-key` with your New Relic User API Key
- Replace `your-account-id` with your New Relic Account ID

**Example (macOS):**
```json
{
  "mcpServers": {
    "newrelic": {
      "command": "node",
      "args": ["/Users/yourusername/newrelic-mcp/dist/index.js"],
      "env": {
        "NEW_RELIC_API_KEY": "NRAK-XXXXXXXXXXXXXXXXXXXXX",
        "NEW_RELIC_ACCOUNT_ID": "1234567"
      }
    }
  }
}
```

After updating the configuration:
1. **Save the file**
2. **Restart Claude Desktop** completely (Quit and reopen)
3. Look for the 🔌 icon in Claude Desktop to verify the MCP server is connected

### Step 2: Import into Claude Code

Once configured in Claude Desktop, you can import the server into Claude Code:

1. Open **Claude Code** in your terminal or IDE
2. The MCP server will be **automatically available** if you have Claude Desktop configured
3. Alternatively, you can add it directly to Claude Code's MCP settings

**For Claude Code direct configuration**, create/edit the file at:
- **macOS/Linux**: `~/.config/claude-code/mcp_settings.json`

With the same configuration format as above.

## Available Tools

### 1. query-logs

Execute custom NRQL queries for complex filtering and aggregations.

**Example queries:**

```
query-logs with query: "SELECT * FROM Log WHERE message LIKE '%error%' SINCE 1 HOUR AGO LIMIT 100"

query-logs with query: "SELECT count(*) FROM Log WHERE level = 'ERROR' FACET host SINCE 1 DAY AGO"

query-logs with query: "SELECT * FROM Log WHERE service.name = 'api-server' AND response.status >= 500 SINCE 30 MINUTES AGO"
```

### 2. search-logs

Simplified search with keyword and attribute filtering.

**Parameters:**
- `keywords` (optional): Text to search for in log messages
- `timeRange` (default: "1 HOUR AGO"): Time range for the search
- `limit` (default: 100): Maximum number of results
- `attributes` (optional): Key-value pairs for filtering

**Example:**

```
search-logs with keywords: "database timeout", timeRange: "2 HOURS AGO", limit: 50

search-logs with keywords: "authentication failed", attributes: { "service.name": "auth-service" }
```

### 3. get-recent-logs

Quick access to the most recent log entries.

**Parameters:**
- `limit` (default: 50): Number of recent entries
- `timeRange` (default: "1 HOUR AGO"): Time window to search

**Example:**

```
get-recent-logs with limit: 100

get-recent-logs with limit: 25, timeRange: "30 MINUTES AGO"
```

### 4. query-apm

Execute custom NRQL queries against APM data for advanced analysis.

**Example queries:**

```
query-apm with query: "SELECT average(duration) FROM Transaction WHERE appName = 'MyApp' SINCE 1 HOUR AGO"

query-apm with query: "SELECT count(*) FROM Transaction WHERE error IS true FACET appName SINCE 1 DAY AGO"

query-apm with query: "SELECT percentile(duration, 95) FROM Transaction WHERE transactionType = 'Web' SINCE 30 MINUTES AGO TIMESERIES"
```

### 5. get-apm-metrics

Get comprehensive application performance metrics including response time, throughput, error rate, and Apdex score.

**Parameters:**
- `appName` (optional): Filter metrics for a specific application. If not provided, returns aggregated metrics across all applications.
- `timeRange` (default: "1 HOUR AGO"): Time range for metrics
- `metrics` (default: ["responseTime", "throughput", "errorRate"]): Array of metrics to retrieve
  - Options: "responseTime", "throughput", "errorRate", "apdex"

**Behavior:**
- With `appName`: Returns time-series metrics for the specified application
- Without `appName`: Returns aggregated metrics across all applications (not broken down by app)

**Examples:**

```
get-apm-metrics with appName: "MyApp", timeRange: "2 HOURS AGO"

get-apm-metrics with metrics: ["responseTime", "errorRate", "apdex"]

get-apm-metrics with appName: "EcommerceApp", metrics: ["throughput", "responseTime"], timeRange: "1 DAY AGO"
```

**Note:** To get metrics for multiple specific applications, call this tool separately for each application name.

### 6. get-transaction-traces

Retrieve transaction traces to identify performance bottlenecks and slow operations.

**Parameters:**
- `appName` (optional): Filter transactions for a specific application
- `minDuration` (optional): Minimum transaction duration in seconds to filter slow transactions
- `limit` (default: 10): Maximum number of transaction traces to return
- `timeRange` (default: "1 HOUR AGO"): Time range to search

**Examples:**

```
get-transaction-traces with appName: "MyApp", minDuration: 2.0, limit: 20

get-transaction-traces with minDuration: 5.0, timeRange: "30 MINUTES AGO"

get-transaction-traces with appName: "APIService", limit: 50
```

## Development

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run in development mode (builds and starts):

```bash
npm run dev
```

Watch mode for auto-rebuilding:

```bash
npm run watch
```

Build the project:

```bash
npm run build
```

## Example Interactions

Once configured, you can ask Claude (in Claude Desktop or Claude Code):

### Log Queries
- "Show me recent errors from New Relic logs"
- "Search for logs containing 'payment failed' in the last 2 hours"
- "Query New Relic for all logs from the api-gateway service with 500 status codes"
- "Get the last 100 log entries from New Relic"
- "Find all logs with response time > 5000ms in the last hour"
- "Show me error logs grouped by service name"

### APM Queries
- "Show me the response time and throughput for MyApp in the last hour"
- "Get APM metrics for all applications including error rates"
- "Find slow transactions that took longer than 3 seconds"
- "What's the error rate for MyApp over the past 2 hours?"
- "Show me the slowest 20 transactions from the EcommerceApp"
- "Get the Apdex score and response time for all my applications"
- "Find all transactions that resulted in errors in the last 30 minutes"

## Troubleshooting

### MCP Server Connection Issues

**Server not showing in Claude Desktop:**
- Verify the config file path is correct for your OS
- Check that the JSON syntax is valid (no trailing commas, proper quotes)
- Ensure the path to `dist/index.js` is absolute, not relative
- Restart Claude Desktop completely (Quit, not just close window)
- Check Claude Desktop logs: `View > Developer > Show Logs`

**"Cannot find module" errors:**
- Make sure you ran `npm install` in the project directory
- Verify you ran `npm run build` to compile TypeScript
- Check that the `dist/` folder exists and contains the compiled files

### New Relic API Issues

**"Configuration error" on startup:**
- Ensure `NEW_RELIC_API_KEY` and `NEW_RELIC_ACCOUNT_ID` are set correctly
- Verify your API key has the necessary permissions (User key, not Ingest key)
- Get your User API key from: https://one.newrelic.com/api-keys

**"Failed to query New Relic":**
- Check your API key is valid and not expired
- Verify your account ID is correct (find it at https://one.newrelic.com/admin-portal)
- Ensure you have access to the Logs product in New Relic
- Test your credentials using the NerdGraph API Explorer

**No results returned:**
- Verify you have log data in New Relic for the specified time range
- Check your NRQL syntax is valid
- Try a broader time range (e.g., "1 DAY AGO" instead of "1 HOUR AGO")
- Use the New Relic UI to confirm logs exist for your query

## NRQL Resources

- [New Relic NRQL Documentation](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/)
- [Log Query Examples](https://docs.newrelic.com/docs/logs/ui-data/query-syntax-logs/)
- [APM Data and NRQL](https://docs.newrelic.com/docs/data-apis/understand-data/event-data/events-reported-apm/)
- [Query APM Metric Data](https://docs.newrelic.com/docs/data-apis/understand-data/metric-data/query-apm-metric-timeslice-data-nrql/)
- [Transaction Event Attributes](https://docs.newrelic.com/attribute-dictionary/?event=Transaction)

## License

MIT
