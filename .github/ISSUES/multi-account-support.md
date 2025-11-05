# Enhancement: Add Multi-Account Support

## Description
Enable querying across multiple New Relic accounts, supporting organizations with separate dev/staging/prod accounts or multiple business units.

## Proposed Changes

### 1. Configuration Updates

Support multiple account configurations:

```json
{
  "mcpServers": {
    "newrelic": {
      "command": "node",
      "args": ["/path/to/newrelic-mcp/dist/index.js"],
      "env": {
        "NEW_RELIC_ACCOUNTS": JSON.stringify([
          {
            "name": "production",
            "apiKey": "NRAK-...",
            "accountId": "1234567"
          },
          {
            "name": "staging",
            "apiKey": "NRAK-...",
            "accountId": "7654321"
          }
        ])
      }
    }
  }
}
```

### 2. Tool Parameter Updates

Add optional `accountId` or `accountName` parameter to all existing tools:

**Example:**
```
get-apm-metrics with accountName: "production", appName: "MyApp"

query-logs with accountId: "1234567", query: "SELECT * FROM Log LIMIT 100"

list-entities with accountName: "staging"
```

### 3. New Tool: `list-accounts`

List all configured accounts.

**Parameters:** None

**Returns:**
```json
[
  {
    "name": "production",
    "accountId": "1234567",
    "isDefault": true
  },
  {
    "name": "staging",
    "accountId": "7654321",
    "isDefault": false
  }
]
```

## Value Proposition

✅ **Multi-environment support** - Query dev/staging/prod from one interface
✅ **Cross-account comparison** - Compare metrics across environments
✅ **Organization flexibility** - Support multiple business units or teams
✅ **Simplified workflow** - No need to reconfigure for different environments

## Implementation Notes

### Configuration Approach
- Support both single account (current) and multi-account configs
- Maintain backward compatibility with existing `NEW_RELIC_API_KEY` setup
- Use first account as default if no account specified in query

### Code Changes Required
- Update `ConfigSchema` in types.ts to support account arrays
- Modify `NewRelicClient` to accept account selector
- Update all tool handlers to pass account context
- Add account validation and error handling

### Alternative: Multiple MCP Servers
Instead of multi-account in one server, users could configure multiple MCP servers:
```json
{
  "mcpServers": {
    "newrelic-prod": { ... },
    "newrelic-staging": { ... }
  }
}
```

**Pros:** Simpler implementation, clear separation
**Cons:** More configuration, less flexible for cross-account queries

## Example Use Cases

- "Compare error rates between production and staging"
- "Show me logs from the staging environment"
- "What's the response time in production vs. development?"
- "List all applications across all accounts"
- "Query production metrics without reconfiguring"

## Migration Path

1. Implement multi-account support with backward compatibility
2. Update README with new configuration examples
3. Provide migration guide for existing users
4. Consider deprecation timeline for old config format (optional)

## Priority
**Low-Medium** - Nice to have, but users can work around with multiple server configs

## Labels
`enhancement`, `feature-request`, `configuration`, `multi-account`

## Alternative Solutions

If full multi-account support is too complex, consider:
1. Documentation for configuring multiple MCP server instances
2. Environment variable switching guide
3. Helper scripts for account switching
