import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { NaverSearchClient } from "./clients/naver-search.client.js";
import { searchToolHandlers } from "./handlers/search.handlers.js";
import { datalabToolHandlers } from "./handlers/datalab.handlers.js";
import { 
  SearchArgsSchema, 
  NaverLocalSearchParamsSchema 
} from "./schemas/search.schemas.js";
import {
  DatalabSearchSchema,
  DatalabShoppingSchema,
  DatalabShoppingDeviceSchema,
  DatalabShoppingGenderSchema,
  DatalabShoppingAgeSchema,
  DatalabShoppingKeywordsSchema,
  DatalabShoppingKeywordDeviceSchema,
  DatalabShoppingKeywordGenderSchema,
  DatalabShoppingKeywordAgeSchema
} from "./schemas/datalab.schemas.js";

// Configuration schema for Smithery
export const configSchema = z.object({
  NAVER_CLIENT_ID: z.string().describe("Naver API Client ID"),
  NAVER_CLIENT_SECRET: z.string().describe("Naver API Client Secret")
});

function createNaverSearchServer({ config }: { config: z.infer<typeof configSchema> }) {
  // Create a new MCP server per MCP spec
  const server = new McpServer({
    name: "naver-search",
    version: "1.0.30",
  });

  // Initialize Naver client with config
  const client = NaverSearchClient.getInstance();
  client.initialize({
    clientId: config.NAVER_CLIENT_ID,
    clientSecret: config.NAVER_CLIENT_SECRET,
  });

  // Register search tools using new 1.17.1 API
  server.registerTool("search_webkr", {
    description: "Perform a search on Naver Web Documents. (네이버 웹문서 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_webkr(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_news", {
    description: "Perform a search on Naver News. (네이버 뉴스 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_news(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_blog", {
    description: "Perform a search on Naver Blog. (네이버 블로그 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_blog(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_shop", {
    description: "Perform a search on Naver Shopping. (네이버 쇼핑 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_shop(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_image", {
    description: "Perform a search on Naver Image. (네이버 이미지 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_image(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_kin", {
    description: "Perform a search on Naver KnowledgeiN. (네이버 지식iN 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_kin(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_book", {
    description: "Perform a search on Naver Book. (네이버 책 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_book(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_encyc", {
    description: "Perform a search on Naver Encyclopedia. (네이버 지식백과 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_encyc(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_academic", {
    description: "Perform a search on Naver Academic. (네이버 전문자료 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_academic(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_local", {
    description: "Perform a search on Naver Local. (네이버 지역 검색)",
    inputSchema: NaverLocalSearchParamsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_local(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("search_cafearticle", {
    description: "Perform a search on Naver Cafe Articles. (네이버 카페글 검색)",
    inputSchema: SearchArgsSchema.shape
  }, async (args) => {
    const result = await searchToolHandlers.search_cafearticle(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // Register datalab tools
  server.registerTool("datalab_search", {
    description: "Perform a trend analysis on Naver search keywords. (네이버 검색어 트렌드 분석)",
    inputSchema: DatalabSearchSchema.shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_search(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_category", {
    description: "Perform a trend analysis on Naver Shopping category. (네이버 쇼핑 카테고리별 트렌드 분석)",
    inputSchema: DatalabShoppingSchema.shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_category(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_by_device", {
    description: "Perform a trend analysis on Naver Shopping by device. (네이버 쇼핑 기기별 트렌드 분석)",
    inputSchema: DatalabShoppingDeviceSchema.pick({
      startDate: true,
      endDate: true,
      timeUnit: true,
      category: true,
      device: true,
    }).shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_by_device(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_by_gender", {
    description: "Perform a trend analysis on Naver Shopping by gender. (네이버 쇼핑 성별 트렌드 분석)",
    inputSchema: DatalabShoppingGenderSchema.pick({
      startDate: true,
      endDate: true,
      timeUnit: true,
      category: true,
      gender: true,
    }).shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_by_gender(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_by_age", {
    description: "Perform a trend analysis on Naver Shopping by age. (네이버 쇼핑 연령별 트렌드 분석)",
    inputSchema: DatalabShoppingAgeSchema.pick({
      startDate: true,
      endDate: true,
      timeUnit: true,
      category: true,
      ages: true,
    }).shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_by_age(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_keywords", {
    description: "Perform a trend analysis on Naver Shopping keywords. (네이버 쇼핑 키워드별 트렌드 분석)",
    inputSchema: DatalabShoppingKeywordsSchema.shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_keywords(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_keyword_by_device", {
    description: "Perform a trend analysis on Naver Shopping keywords by device. (네이버 쇼핑 키워드 기기별 트렌드 분석)",
    inputSchema: DatalabShoppingKeywordDeviceSchema.shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_keyword_by_device(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_keyword_by_gender", {
    description: "Perform a trend analysis on Naver Shopping keywords by gender. (네이버 쇼핑 키워드 성별 트렌드 분석)",
    inputSchema: DatalabShoppingKeywordGenderSchema.shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_keyword_by_gender(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.registerTool("datalab_shopping_keyword_by_age", {
    description: "Perform a trend analysis on Naver Shopping keywords by age. (네이버 쇼핑 키워드 연령별 트렌드 분석)",
    inputSchema: DatalabShoppingKeywordAgeSchema.shape
  }, async (args) => {
    const result = await datalabToolHandlers.datalab_shopping_keyword_by_age(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  return server.server;
}

// Export default for Smithery compatibility
export default createNaverSearchServer;

// Main function to run the server when executed directly
async function main() {
  try {
    console.error("Starting Naver Search MCP Server...");
    
    // Get config from environment variables - check for empty strings too
    const clientId = process.env.NAVER_CLIENT_ID?.trim();
    const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
    
    console.error("Environment variables:", {
      NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID ? `[${process.env.NAVER_CLIENT_ID.length} chars]` : 'undefined',
      NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET ? `[${process.env.NAVER_CLIENT_SECRET.length} chars]` : 'undefined'
    });
    
    if (!clientId || !clientSecret) {
      throw new Error(`Missing required environment variables:
        NAVER_CLIENT_ID: ${clientId ? 'provided' : 'missing'}
        NAVER_CLIENT_SECRET: ${clientSecret ? 'provided' : 'missing'}
        
        Please set these environment variables before running the server.`);
    }
    
    const config = {
      NAVER_CLIENT_ID: clientId,
      NAVER_CLIENT_SECRET: clientSecret
    };

    console.error("Config loaded successfully");

    // Validate config
    const validatedConfig = configSchema.parse(config);
    console.error("Config validated successfully");

    // Create server instance  
    const serverFactory = createNaverSearchServer({ config: validatedConfig });
    console.error("Server factory created");
    
    // Create transport and run server
    const transport = new StdioServerTransport();
    console.error("Transport created, connecting...");
    
    await serverFactory.connect(transport);
    console.error("Server connected and running");
    
  } catch (error) {
    console.error("Error in main function:", error);
    throw error;
  }
}

// Run main function if this file is executed directly
// Note: Always run main in CLI mode since this is an MCP server
console.error("Starting MCP server initialization...");
console.error("process.argv:", process.argv);

// Check if running as main module - compatible with both ESM and CommonJS
let isMainModule = false;
try {
  // Try ESM approach first
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    console.error("import.meta.url:", import.meta.url);
    isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                   import.meta.url.endsWith(process.argv[1]) ||
                   process.argv[1].endsWith("index.js");
  } else {
    // Fallback for CommonJS or when import.meta is not available
    isMainModule = process.argv[1].endsWith("index.js") || 
                   process.argv[1].includes("naver-search-mcp");
  }
} catch (error) {
  // Fallback for environments where import.meta causes issues
  isMainModule = process.argv[1].endsWith("index.js") || 
                 process.argv[1].includes("naver-search-mcp");
}

console.error("isMainModule:", isMainModule);

if (isMainModule) {
  console.error("Running as main module, starting server...");
  main().catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
} else {
  console.error("Not running as main module, skipping server start");
}
