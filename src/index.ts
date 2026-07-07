#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import WeztermExecutor from "./wezterm_executor.js";
import WeztermOutputReader from "./wezterm_output_reader.js";
import SendControlCharacter from "./send_control_character.js";

const server = new Server(
  {
    name: "wezterm-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "write_to_terminal",
        description:
          "EXECUTION TOOL. Transmits a command or text to a specific WezTerm pane by ID and executes it. WHEN: 'run this command', 'execute in pane', 'send to terminal'. Returns confirmation text only — does NOT return command output; follow with read_terminal_output to capture results. Example: write 'npm test' to pane 3.",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description:
                "The command to run or text to write to the terminal",
            },
            pane_id: {
              type: "number",
              description: "ID of the pane to write to",
            },
          },
          required: ["command", "pane_id"],
        },
      },
      {
        name: "read_terminal_output",
        description:
          "EXECUTION TOOL. Captures recent visible text from a WezTerm pane's scrollback buffer. WHEN: 'show terminal output', 'what did the command print', 'read pane output'. Returns up to N lines of text (default 50). Does NOT execute commands; use write_to_terminal first. Example: read 100 lines from pane 2 after running a build.",
        inputSchema: {
          type: "object",
          properties: {
            lines: {
              type: "number",
              description:
                "Number of lines to read from the terminal (default: 50)",
            },
            pane_id: {
              type: "number",
              description:
                "ID of the pane to read from (optional, defaults to current pane)",
            },
          },
        },
      },
      {
        name: "send_control_character",
        description:
          "EXECUTION TOOL. Injects a terminal control character (Ctrl+key) into a specific WezTerm pane. WHEN: 'interrupt process', 'send Ctrl+C', 'stop running command', 'send EOF'. Supported keys: c d z l a e k u w. Does NOT send printable text — use write_to_terminal for that. Returns confirmation; no output captured. Example: send 'c' to pane 1 to kill a hung process.",
        inputSchema: {
          type: "object",
          properties: {
            character: {
              type: "string",
              description: "Control character to send (e.g., 'c' for Ctrl+C)",
            },
            pane_id: {
              type: "number",
              description: "ID of the pane to send the character to",
            },
          },
          required: ["character", "pane_id"],
        },
      },
      {
        name: "list_panes",
        description:
          "EXECUTION TOOL. Enumerates all open panes in the current WezTerm session, returning pane IDs, active state, and titles. WHEN: 'what panes are open', 'show pane list', 'which pane is active', 'find pane ID'. Does NOT switch focus or read pane content. Use returned pane_id values with other tools. Example: call before write_to_terminal to discover the target pane_id.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "switch_pane",
        description:
          "EXECUTION TOOL. Activates a WezTerm pane by ID, moving keyboard focus to it. WHEN: 'switch to pane', 'focus pane', 'activate pane', 'move to terminal'. Returns confirmation only — does NOT read content or send input. Use list_panes first to resolve the correct pane_id. Example: switch to pane 2 to bring an editor pane into focus.",
        inputSchema: {
          type: "object",
          properties: {
            pane_id: {
              type: "number",
              description: "ID of the pane to switch to",
            },
          },
          required: ["pane_id"],
        },
      },
      {
        name: "close_pane",
        description:
          "EXECUTION TOOL. Terminates and removes a WezTerm pane by ID, killing any process running inside it. WHEN: 'close pane', 'kill pane', 'remove terminal', 'clean up pane'. Destructive and irreversible — any unsaved state in the pane is lost. Does NOT close tabs or windows. Returns confirmation only. Example: close pane 4 after a finished build job.",
        inputSchema: {
          type: "object",
          properties: {
            pane_id: {
              type: "number",
              description: "ID of the pane to close",
            },
          },
          required: ["pane_id"],
        },
      },
      {
        name: "split_pane",
        description:
          "EXECUTION TOOL. Divides an existing WezTerm pane into two by splitting in the given direction (Right, Left, Top, Bottom), opening a new shell in the new pane. WHEN: 'split terminal', 'open new pane', 'create side-by-side panes'. Returns the new pane's ID — store it to target subsequent commands. Does NOT send any input to the new pane. Example: split pane 1 Right, then write_to_terminal to the returned pane ID.",
        inputSchema: {
          type: "object",
          properties: {
            pane_id: {
              type: "number",
              description: "ID of the pane to split",
            },
            direction: {
              type: "string",
              enum: ["Right", "Left", "Top", "Bottom"],
              description:
                "Direction of the split: Right, Left, Top, or Bottom",
            },
          },
          required: ["pane_id", "direction"],
        },
      },
    ],
  };
});

// Tool execution
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const executor = new WeztermExecutor();
  const outputReader = new WeztermOutputReader();
  const controlCharSender = new SendControlCharacter();

  switch (request.params.name) {
    case "write_to_terminal":
      return await executor.writeToTerminal(
        request.params.arguments.command,
        request.params.arguments.pane_id
      );

    case "read_terminal_output":
      const lines = request.params.arguments.lines || 50;
      const paneId = request.params.arguments.pane_id;
      return await outputReader.readOutput(lines, paneId);

    case "send_control_character":
      return await controlCharSender.send(
        request.params.arguments.character,
        request.params.arguments.pane_id
      );

    case "list_panes":
      return await executor.listPanes();

    case "switch_pane":
      return await executor.switchPane(request.params.arguments.pane_id);

    case "close_pane":
      return await executor.closePane(request.params.arguments.pane_id);

    case "split_pane":
      return await executor.splitPane(
        request.params.arguments.pane_id,
        request.params.arguments.direction
      );

    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
