import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { NaverSearchClient } from "./clients/naver-search.client.js";
import { searchTools } from "./tools/search.tools.js";
import { datalabTools } from "./tools/datalab.tools.js";
import { searchToolHandlers } from "./handlers/search.handlers.js";
import { datalabToolHandlers } from "./handlers/datalab.handlers.js";

// Configuration schema for Smithery
export const configSchema = z.object({
  NAVER_CLIENT_ID: z.string().describe("Naver API Client ID"),
  NAVER_CLIENT_SECRET: z.string().describe("Naver API Client Secret")
});

export default function ({ config }: { config: z.infer<typeof configSchema> }) {
  // Create a new MCP server per MCP spec
  const server = new McpServer({
    name: "naver-search",
    version: "1.0.18",
  });

  // Initialize Naver client with config
  const client = NaverSearchClient.getInstance();
  client.initialize({
    clientId: config.NAVER_CLIENT_ID,
    clientSecret: config.NAVER_CLIENT_SECRET,
  });

  const toolHandlers: Record<string, (args: any) => Promise<any>> = {
    ...searchToolHandlers,
    ...datalabToolHandlers,
  };

  // Add all search tools
  searchTools.forEach(tool => {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema as any,
      async (args: any) => {
        try {
          const handler = toolHandlers[tool.name];
          if (!handler) throw new Error(`Unknown tool: ${tool.name}`);
          const result = await handler(args);
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: "text" as const, text: `Error: ${errorMessage}` }],
            isError: true,
          };
        }
      }
    );
  });

  // Add all datalab tools
  datalabTools.forEach(tool => {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema as any,
      async (args: any) => {
        try {
          const handler = toolHandlers[tool.name];
          if (!handler) throw new Error(`Unknown tool: ${tool.name}`);
          const result = await handler(args);
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: "text" as const, text: `Error: ${errorMessage}` }],
            isError: true,
          };
        }
      }
    );
  });

  return server.server;
}
