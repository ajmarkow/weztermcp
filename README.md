# WezTerm MCP Server

## Overview

This is a MCP server for WezTerm.
It allows you to control WezTerm from Claude Desktop and other MCP clients.

## Tools

| Tool | Required Args | Optional Args | Description |
|---|---|---|---|
| `write_to_terminal` | `command: string`, `pane_id: number` | — | Writes text or runs a command in the specified pane |
| `read_terminal_output` | — | `lines: number` (default 50), `pane_id: number` | Reads output from the active pane or a specific pane by ID |
| `send_control_character` | `character: string` | — | Sends a control character to the active pane (e.g. `"c"` for Ctrl+C) |
| `list_panes` | — | — | Lists all panes in the current WezTerm window |
| `switch_pane` | `pane_id: number` | — | Switches focus to the specified pane |
| `write_to_specific_pane` | `command: string`, `pane_id: number` | — | Writes text or runs a command in a specific pane by ID |
| `split_pane` | `pane_id: number`, `direction: "Right"\|"Left"\|"Top"\|"Bottom"` | — | Splits the specified pane and returns the new pane ID |

## Installation

To use with Claude Desktop, add the server config:

```json
{
  "mcpServers": {
    "wezterm-mcp": {
      "command": "npx",
      "args": ["-y", "wezterm-mcp"]
    }
  }
}
```

To install WezTerm for Claude Desktop automatically via Smithery:

```bash
npx -y @smithery/cli install @hiraishikentaro/wezterm-mcp --client claude
```

[![smithery badge](https://smithery.ai/badge/@hiraishikentaro/wezterm-mcp)](https://smithery.ai/server/@hiraishikentaro/wezterm-mcp)
