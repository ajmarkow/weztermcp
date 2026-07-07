# WezTerm MCP Server

## Overview

This is a MCP server for WezTerm.
It allows you to control WezTerm from Claude Desktop and other MCP clients.

## Tools

| Tool | Required Args | Optional Args | Description |
|---|---|---|---|
| `wezterm_pane_write` | `command: string`, `pane_id: number` | — | Writes text or runs a command in the specified pane |
| `wezterm_pane_read` | — | `lines: number` (default 50), `pane_id: number` | Reads output from a pane's scrollback buffer |
| `wezterm_pane_send_key` | `character: string`, `pane_id: number` | — | Sends a control character to the specified pane (e.g. `"c"` for Ctrl+C) |
| `wezterm_pane_list` | — | — | Lists all panes in the current WezTerm session |
| `wezterm_pane_switch` | `pane_id: number` | — | Switches focus to the specified pane |
| `wezterm_pane_close` | `pane_id: number` | — | Closes the specified pane |
| `wezterm_pane_split` | `pane_id: number`, `direction: "Right"\|"Left"\|"Top"\|"Bottom"` | — | Splits the specified pane and returns the new pane ID |

## Security

This server gives an MCP client the ability to run arbitrary shell commands in any open WezTerm pane, with the full permissions of the user running WezTerm. There is no sandboxing, allowlisting, or command filtering — `wezterm_pane_write` will execute anything sent to it, including destructive operations like `rm -rf`, force pushes, or database migrations.

**Risk model:**
- Any agent connected to this server can read, write, and close panes it did not open, including ones with unrelated work in progress.
- `wezterm_pane_write` and `wezterm_pane_close` are flagged in their tool descriptions as requiring user confirmation before destructive or irreversible actions, but this is advisory only — the server itself does not block or intercept any command.
- Only connect this server to trusted MCP clients, and review agent-issued commands before they run if your client supports that.

## Installation

To use with Claude Desktop, add the server config:

```json
{
  "mcpServers": {
    "weztermcp": {
      "command": "npx",
      "args": ["-y", "weztermcp"]
    }
  }
}
```

## Releasing

Publishing to npm is automated via `.github/workflows/publish.yml`. On every push to `main`, CI runs the test suite and build, then publishes to npm if `package.json`'s `version` field isn't already published — no publish happens if the version is unchanged.

To cut a release:

1. Bump `version` in `package.json` (e.g. `npm version patch`, `npm version minor`, or edit directly).
2. Commit and push to `main`.
3. CI runs tests, builds, and publishes automatically if the tests pass and the version is new.

Publishing requires an `NPM_TOKEN` repository secret (an npm access token with publish rights to this package) configured in GitHub repo settings.
