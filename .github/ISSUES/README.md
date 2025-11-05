# Future Enhancement Issues

This directory contains detailed specifications for proposed enhancements to the New Relic MCP Server.

## How to Create These Issues

You can create GitHub issues from these templates in several ways:

### Option 1: GitHub CLI
```bash
# From the repository root
gh issue create --title "Enhancement: Add Alert Management Tools" \
  --body-file .github/ISSUES/alert-management.md \
  --label enhancement,feature-request

gh issue create --title "Enhancement: Add Entity Discovery & Management Tools" \
  --body-file .github/ISSUES/entity-discovery.md \
  --label enhancement,feature-request,ux-improvement

gh issue create --title "Enhancement: Add Enhanced Error Analytics Tools" \
  --body-file .github/ISSUES/enhanced-error-analytics.md \
  --label enhancement,feature-request

gh issue create --title "Enhancement: Add Multi-Account Support" \
  --body-file .github/ISSUES/multi-account-support.md \
  --label enhancement,feature-request
```

### Option 2: GitHub Web UI
1. Go to https://github.com/xelber/newrelic-mcp/issues/new
2. Copy the content from each `.md` file
3. Paste into the issue description
4. Add appropriate labels
5. Submit the issue

### Option 3: GitHub API
```bash
# Using curl with GitHub API
REPO="xelber/newrelic-mcp"
TOKEN="your_github_token"

curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/issues" \
  -d @- <<EOF
{
  "title": "Enhancement: Add Alert Management Tools",
  "body": "$(cat .github/ISSUES/alert-management.md)",
  "labels": ["enhancement", "feature-request"]
}
EOF
```

## Enhancement Priority Summary

| Enhancement | Priority | Complexity | Impact |
|-------------|----------|------------|--------|
| **Entity Discovery** | High | Medium | High - Improves UX significantly |
| **Alert Management** | Medium | Medium | Medium - Enables incident response |
| **Enhanced Error Analytics** | Medium | Low | Medium - Better debugging |
| **Multi-Account Support** | Low-Medium | High | Low - Can use multiple servers |

## Recommended Implementation Order

1. ✅ **APM Metrics Access** - COMPLETED
2. 🎯 **Entity Discovery & Management** - Highest remaining priority
3. 📊 **Alert Management** - Natural next step after entity discovery
4. 🐛 **Enhanced Error Analytics** - Complements existing log tools
5. 🏢 **Multi-Account Support** - Nice to have, lower priority

## Contributing

If you'd like to implement any of these enhancements:

1. Comment on the issue to claim it
2. Create a feature branch: `feature/entity-discovery`, `feature/alert-management`, etc.
3. Implement with tests (follow APM metrics implementation as reference)
4. Update README documentation
5. Submit a pull request

## Questions?

For discussion about these enhancements, please use the GitHub issues or discussions feature.
