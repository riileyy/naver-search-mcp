# Naver Search MCP Server (Fixed Version)

This is a fixed version of the original [@isnow890/naver-search-mcp](https://github.com/isnow890/naver-search-mcp) package.

## What was fixed?

The original package was missing required MCP protocol methods (`prompts/list` and `resources/list`), causing "Method not found" errors in MCP clients like Cursor and Claude Desktop.

### Changes made:
- ✅ Added missing MCP protocol handlers for `prompts/list` and `resources/list` methods
- ✅ Added `prompts` and `resources` capabilities to server configuration
- ✅ Improved compatibility with all MCP clients (Cursor, Claude Desktop, etc.)
- ✅ Fixed "Method not found" errors

## Original Source
- **Original package**: [@isnow890/naver-search-mcp](https://github.com/isnow890/naver-search-mcp)
- **Original author**: [isnow890](https://github.com/isnow890)
- **Original license**: MIT

## Installation

### Quick Install via NPX

```bash
npx @d429/naver-search-mcp-fixed
```

### Manual Installation

```bash
npm install @d429/naver-search-mcp-fixed
```

## Environment Variables

```bash
# Windows
set NAVER_CLIENT_ID=your_client_id
set NAVER_CLIENT_SECRET=your_client_secret

# Linux/Mac
export NAVER_CLIENT_ID=your_client_id
export NAVER_CLIENT_SECRET=your_client_secret
```

## Cursor Configuration

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "naver-search": {
      "command": "npx",
      "args": ["-y", "@d429/naver-search-mcp-fixed"],
      "env": {
        "NAVER_CLIENT_ID": "your_client_id",
        "NAVER_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Claude Desktop Configuration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "naver-search": {
      "command": "npx",
      "args": ["-y", "@d429/naver-search-mcp-fixed"],
      "env": {
        "NAVER_CLIENT_ID": "your_client_id",
        "NAVER_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

## Available Tools

### Search Tools:
- **search_webkr**: Search Naver web documents
- **search_news**: Search Naver news
- **search_blog**: Search Naver blogs
- **search_cafearticle**: Search Naver cafe articles
- **search_shop**: Search Naver shopping
- **search_image**: Search Naver images
- **search_kin**: Search Naver KnowledgeiN
- **search_book**: Search Naver books
- **search_encyc**: Search Naver encyclopedia
- **search_academic**: Search Naver academic papers
- **search_local**: Search Naver local places

### DataLab Tools:
- **datalab_search**: Analyze search term trends
- **datalab_shopping_category**: Analyze shopping category trends
- **datalab_shopping_by_device**: Analyze shopping trends by device
- **datalab_shopping_by_gender**: Analyze shopping trends by gender
- **datalab_shopping_by_age**: Analyze shopping trends by age group
- **datalab_shopping_keywords**: Analyze shopping keyword trends
- **datalab_shopping_keyword_by_device**: Analyze shopping keyword trends by device
- **datalab_shopping_keyword_by_gender**: Analyze shopping keyword trends by gender
- **datalab_shopping_keyword_by_age**: Analyze shopping keyword trends by age group

## Prerequisites

- Naver Developers API Key (Client ID and Secret)
- Node.js 18 or higher
- NPM 8 or higher

## Getting API Keys

1. Visit [Naver Developers](https://developers.naver.com/apps/#/register)
2. Click "Register Application"
3. Enter application name and select ALL of the following APIs:
   - Search (for blog, news, book search, etc.)
   - DataLab (Search Trends)
   - DataLab (Shopping Insight)
4. Set the obtained Client ID and Client Secret as environment variables

## Build

```bash
npm install
npm run build
```

## License

MIT License - Same as original package
