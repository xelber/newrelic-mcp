# Enhancement: Add Entity Discovery & Management Tools

## Description
Add MCP tools to browse and discover New Relic entities (applications, services, hosts), making the server self-documenting and enabling exploratory queries.

## Proposed Tools

### 1. `list-entities`
Discover available applications, services, hosts, and other entities.

**Parameters:**
- `type` (optional): Filter by entity type (APPLICATION, HOST, SERVICE, etc.)
- `tags` (optional): Filter by tags (key-value pairs)
- `limit` (default: 100): Maximum number of entities to return

**Example:**
```
list-entities with type: "APPLICATION"

list-entities with tags: {"environment": "production", "team": "platform"}
```

### 2. `get-entity-details`
Get detailed configuration and metadata for a specific entity.

**Parameters:**
- `entityGuid` (required): The GUID of the entity to query
- `includeMetrics` (optional, default: false): Include recent metric summary

**Example:**
```
get-entity-details with entityGuid: "MjUyMDUyOHxBUE18QVBQTElDQVRJT058MjE1MDM3Nzk1"
```

### 3. `search-entities`
Search for entities by name, type, or tags.

**Parameters:**
- `query` (required): Search query string
- `type` (optional): Filter by entity type
- `limit` (default: 50): Maximum results

**Example:**
```
search-entities with query: "api", type: "APPLICATION"

search-entities with query: "production"
```

## Value Proposition

✅ **Self-documenting** - Users don't need to know exact entity names beforehand
✅ **Exploratory queries** - "What services are running in production?"
✅ **Context discovery** - Find related entities and dependencies
✅ **Better UX** - Browse available resources before querying metrics

## Implementation Notes

- Use NerdGraph's entity search capabilities
- Entity GUIDs are used throughout New Relic APIs
- Can leverage existing NerdGraph client infrastructure
- Consider caching entity lists for performance

## Example Use Cases

- "What applications do I have in New Relic?"
- "Show me all production services"
- "Find all hosts tagged with 'database'"
- "What entities are related to my API service?"
- "List all APM applications I can query metrics for"

## Technical Details

**NerdGraph Query Example:**
```graphql
{
  actor {
    entitySearch(query: "type = 'APPLICATION'") {
      results {
        entities {
          guid
          name
          type
          tags {
            key
            values
          }
        }
      }
    }
  }
}
```

## Priority
**High** - Significantly improves user experience and discoverability

## Labels
`enhancement`, `feature-request`, `entity-management`, `ux-improvement`
