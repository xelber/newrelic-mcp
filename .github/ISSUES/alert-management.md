# Enhancement: Add Alert Management Tools

## Description
Add MCP tools to query and analyze New Relic alerts and incidents, enabling AI-assisted incident response and alert pattern analysis.

## Proposed Tools

### 1. `list-alerts`
Get active alerts and violations across the account.

**Parameters:**
- `severity` (optional): Filter by severity (CRITICAL, WARNING, etc.)
- `timeRange` (default: "1 HOUR AGO"): Time window for alerts
- `limit` (default: 50): Maximum number of alerts to return

**Example:**
```
list-alerts with severity: "CRITICAL", timeRange: "24 HOURS AGO"
```

### 2. `get-alert-history`
Retrieve historical alert data for pattern analysis.

**Parameters:**
- `alertPolicyName` (optional): Filter by specific alert policy
- `timeRange` (default: "1 DAY AGO"): Historical time range
- `limit` (default: 100): Maximum results

**Example:**
```
get-alert-history with alertPolicyName: "Production API Alerts", timeRange: "7 DAYS AGO"
```

### 3. `query-incidents`
Search through incident history with flexible filtering.

**Parameters:**
- `state` (optional): Filter by state (OPEN, CLOSED, ACKNOWLEDGED)
- `timeRange` (default: "1 DAY AGO"): Time range to search
- `limit` (default: 50): Maximum incidents to return

**Example:**
```
query-incidents with state: "OPEN", timeRange: "1 WEEK AGO"
```

## Value Proposition

✅ **Enables AI-assisted incident response** - Claude can help diagnose and triage alerts
✅ **Pattern recognition** - Identify recurring alert patterns and correlations
✅ **Proactive monitoring** - Ask Claude to check for active alerts before deployments
✅ **Historical analysis** - Understand alert trends over time

## Implementation Notes

- Use NerdGraph API for alert queries
- Leverage existing NRQL infrastructure where possible
- May need AlertNrqlCondition and NrAiIncident event types
- Consider using New Relic's Alerts API v2 as alternative

## Example Use Cases

- "Are there any critical alerts in production right now?"
- "Show me all database-related alerts from the last week"
- "What incidents were triggered during last night's deployment?"
- "Find patterns in our alert history for the API service"

## Priority
**Medium** - Complements existing observability capabilities

## Labels
`enhancement`, `feature-request`, `alert-management`
