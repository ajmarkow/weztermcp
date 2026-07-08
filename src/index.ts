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
    name: "weztermcp",
    title: "WezTerm MCP Server",
    version: "0.1.2",
    description: "Control WezTerm panes, tabs, and windows from an MCP client via the WezTerm CLI.",
    websiteUrl: "https://github.com/ajmarkow/weztermcp",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions:
      "wezterm_pane_write does not return command output — follow it with wezterm_pane_read to see results. " +
      "For a long-running command, wezterm_pane_read is a snapshot, not a wait — call it again after some time to check progress rather than assuming one read captures the final output. " +
      "Call wezterm_pane_list first to discover valid pane_id values before targeting a pane with any other tool. " +
      "wezterm_pane_close is destructive and irreversible; confirm with the user before closing a pane.",
  }
);

const executor = new WeztermExecutor();
const outputReader = new WeztermOutputReader();
const controlCharSender = new SendControlCharacter();

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "wezterm_pane_write",
        title: "Write to WezTerm Pane",
        description:
          "EXECUTION TOOL. Transmits a command or text to a specific WezTerm pane by ID and executes it. WHEN: 'run this command', 'execute in pane', 'send to terminal'. Returns confirmation text only — does NOT return command output; follow with wezterm_pane_read to capture results. SECURITY: this runs arbitrary shell commands with the user's full permissions in a live terminal. Confirm with the user before sending destructive or irreversible commands (e.g. rm, git push --force, database migrations). Example: write 'npm test' to pane 3.",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description:
                "Text to send to the pane. A newline (\\n) is automatically appended, causing the shell to execute the input as a command. To type text without executing, omit a trailing newline by ending with a space or partial input — but note this tool always appends \\n, so use wezterm_pane_send_key for raw control sequences instead.",
            },
            pane_id: {
              type: "number",
              description:
                "Integer ID of the target pane. Obtain valid IDs from wezterm_pane_list. Must be a currently open pane.",
            },
          },
          required: ["command", "pane_id"],
        },
      },
      {
        name: "wezterm_pane_read",
        title: "Read WezTerm Pane Output",
        description:
          "EXECUTION TOOL. Captures recent visible text from a WezTerm pane's scrollback buffer. WHEN: 'show terminal output', 'what did the command print', 'read pane output'. Returns up to N lines of text (default 50). Does NOT execute commands; use wezterm_pane_write first. Example: read 100 lines from pane 2 after running a build.",
        inputSchema: {
          type: "object",
          properties: {
            lines: {
              type: "number",
              description:
                "Number of lines to read from the scrollback buffer. Default: 50. Use 0 or a negative value to read the current screen only (no scrollback). Large values (e.g. 500) capture more history but may include stale output.",
            },
            pane_id: {
              type: "number",
              description:
                "Integer ID of the pane to read from. Obtain valid IDs from wezterm_pane_list.",
            },
          },
          required: ["pane_id"],
        },
      },
      {
        name: "wezterm_pane_send_key",
        title: "Send Control Key to WezTerm Pane",
        description:
          "EXECUTION TOOL. Injects a terminal control character (Ctrl+key) into a specific WezTerm pane. WHEN: 'interrupt process', 'send Ctrl+C', 'stop running command', 'send EOF'. Supported keys: c d z l a e k u w. Does NOT send printable text — use wezterm_pane_write for that. Returns confirmation; no output captured. Example: send 'c' to pane 1 to kill a hung process.",
        inputSchema: {
          type: "object",
          properties: {
            character: {
              type: "string",
              description:
                "Single letter key to combine with Ctrl. Case-insensitive. Supported values: 'c' (SIGINT), 'd' (EOF), 'z' (SIGTSTP), 'l' (clear screen), 'a' (start of line), 'e' (end of line), 'k' (kill to end), 'u' (kill to start), 'w' (kill word). Any other value returns an error.",
            },
            pane_id: {
              type: "number",
              description:
                "Integer ID of the target pane. Obtain valid IDs from wezterm_pane_list. Must be a currently open pane.",
            },
          },
          required: ["character", "pane_id"],
        },
      },
      {
        name: "wezterm_pane_list",
        title: "List WezTerm Panes",
        description:
          "EXECUTION TOOL. Enumerates open panes, returning pane IDs, window/tab IDs, and titles. WHEN: 'what panes are open', 'show pane list', 'which pane is active', 'find pane ID'. Default (no window_id/tab_id): scoped to the currently active/focused window and tab only, not every pane across every window. Pass window_id and/or tab_id to list panes elsewhere. Does NOT switch focus or read pane content. Use returned pane_id values with other tools. Example: call before wezterm_pane_write to discover the target pane_id.",
        inputSchema: {
          type: "object",
          properties: {
            window_id: {
              type: "number",
              description:
                "Integer ID of the window to scope the listing to. Default: the window containing the currently focused pane. Combine with wezterm_pane_list (no args) to discover window_id values.",
            },
            tab_id: {
              type: "number",
              description:
                "Integer ID of the tab to scope the listing to. Default: the tab containing the currently focused pane. Combine with wezterm_pane_list (no args) to discover tab_id values.",
            },
          },
        },
      },
      {
        name: "wezterm_pane_switch",
        title: "Switch WezTerm Pane Focus",
        description:
          "EXECUTION TOOL. Activates a WezTerm pane by ID, moving keyboard focus to it. WHEN: 'switch to pane', 'focus pane', 'activate pane', 'move to terminal'. Returns confirmation only — does NOT read content or send input. Use wezterm_pane_list first to resolve the correct pane_id. Example: switch to pane 2 to bring an editor pane into focus.",
        inputSchema: {
          type: "object",
          properties: {
            pane_id: {
              type: "number",
              description:
                "Integer ID of the pane to activate. Obtain valid IDs from wezterm_pane_list. Must be a currently open pane.",
            },
          },
          required: ["pane_id"],
        },
      },
      {
        name: "wezterm_pane_close",
        title: "Close WezTerm Pane",
        description:
          "EXECUTION TOOL. Terminates and removes a WezTerm pane by ID, killing any process running inside it. WHEN: 'close pane', 'kill pane', 'remove terminal', 'clean up pane'. Destructive and irreversible — any unsaved state in the pane is lost. Does NOT close tabs or windows. Returns confirmation only. SECURITY: confirm with the user before closing a pane that may be running an unsaved or long-lived process. Example: close pane 4 after a finished build job.",
        inputSchema: {
          type: "object",
          properties: {
            pane_id: {
              type: "number",
              description:
                "Integer ID of the pane to close. Obtain valid IDs from wezterm_pane_list. Closing the last pane in a tab will close the tab.",
            },
          },
          required: ["pane_id"],
        },
      },
      {
        name: "wezterm_pane_split",
        title: "Split WezTerm Pane",
        description:
          "EXECUTION TOOL. Divides an existing WezTerm pane into two by splitting in the given direction (Right, Left, Top, Bottom), opening a new shell in the new pane. WHEN: 'split terminal', 'open new pane', 'create side-by-side panes'. Returns the new pane's ID — store it to target subsequent commands. Does NOT send any input to the new pane. Example: split pane 1 Right, then wezterm_pane_write to the returned pane ID.",
        inputSchema: {
          type: "object",
          properties: {
            pane_id: {
              type: "number",
              description:
                "Integer ID of the pane to split. Obtain valid IDs from wezterm_pane_list. The existing pane retains its content; the new pane opens a fresh shell. Default: the currently focused pane, optionally narrowed by window_id/tab_id.",
            },
            window_id: {
              type: "number",
              description:
                "Only used when pane_id is omitted. Scopes which window's focused pane is split. Default: the window containing the currently focused pane.",
            },
            tab_id: {
              type: "number",
              description:
                "Only used when pane_id is omitted. Scopes which tab's focused pane is split. Default: the tab containing the currently focused pane.",
            },
            direction: {
              type: "string",
              enum: ["Right", "Left", "Top", "Bottom"],
              description:
                "Direction in which to create the new pane relative to the existing one. 'Right' and 'Left' split vertically (side by side); 'Top' and 'Bottom' split horizontally (stacked). Must be exactly one of: Right, Left, Top, Bottom (case-sensitive).",
            },
          },
          required: ["direction"],
        },
      },
      {
        name: "wezterm_window_spawn",
        title: "Spawn WezTerm Window",
        description:
          "EXECUTION TOOL. Opens a brand new WezTerm window with a fresh shell, using `wezterm cli spawn --new-window`. WHEN: 'open a new window', 'spawn a window', 'create a separate WezTerm window'. Panes are the primary entity for most work — prefer wezterm_pane_split for a new pane within the current window/tab. Use this only when a genuinely separate top-level window is needed. Returns the new pane's ID (the initial pane of the new window) — store it to target subsequent commands. Example: spawn a new window, then wezterm_pane_write to the returned pane ID.",
        inputSchema: {
          type: "object",
          properties: {
            cwd: {
              type: "string",
              description:
                "Absolute path to start the new window's shell in. Default: WezTerm's default working directory (typically the user's home directory or the directory of the currently focused pane, depending on configuration).",
            },
          },
        },
      },
    ],
  };
});

// Tool execution
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  switch (request.params.name) {
    case "wezterm_pane_write":
      return await executor.writeToTerminal(
        request.params.arguments.command,
        request.params.arguments.pane_id
      );

    case "wezterm_pane_read":
      const lines = request.params.arguments.lines || 50;
      const paneId = request.params.arguments.pane_id;
      return await outputReader.readOutput(paneId, lines);

    case "wezterm_pane_send_key":
      return await controlCharSender.send(
        request.params.arguments.character,
        request.params.arguments.pane_id
      );

    case "wezterm_pane_list":
      return await executor.listPanes(
        request.params.arguments.window_id,
        request.params.arguments.tab_id
      );

    case "wezterm_pane_switch":
      return await executor.switchPane(request.params.arguments.pane_id);

    case "wezterm_pane_close":
      return await executor.closePane(request.params.arguments.pane_id);

    case "wezterm_pane_split":
      return await executor.splitPane(
        request.params.arguments.pane_id,
        request.params.arguments.direction,
        request.params.arguments.window_id,
        request.params.arguments.tab_id
      );

    case "wezterm_window_spawn":
      return await executor.spawnWindow(request.params.arguments?.cwd);

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
