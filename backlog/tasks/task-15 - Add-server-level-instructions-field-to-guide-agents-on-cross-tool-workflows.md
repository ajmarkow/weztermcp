---
id: TASK-15
title: Add server-level instructions field to guide agents on cross-tool workflows
status: In Progress
assignee:
  - '@me'
created_date: '2026-07-07 22:01'
updated_date: '2026-07-08 02:46'
labels:
  - mcp
  - docs
dependencies: []
priority: medium
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Per MCP blog post on server instructions (blog.modelcontextprotocol.io/posts/2025-11-03-using-server-instructions), the Server constructor's 'instructions' field is injected into the model's system prompt independent of any single tool call, and is the right place for cross-tool relationships that individual tool descriptions can't convey. weztermcp currently sets no instructions field. Candidates: wezterm_pane_write does not return command output, so it must be followed by wezterm_pane_read to see results; wezterm_pane_list should generally be called first to discover valid pane_id values before any other tool; wezterm_pane_close is destructive and irreversible; wezterm_pane_send_key is for control characters only, not printable text (use wezterm_pane_write for that). Per the article's anti-patterns, keep instructions concise, factual, and free of anything already covered in tool descriptions or unrelated behavioral asks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 instructions field added to the Server constructor in src/index.ts
- [x] #2 Instructions capture the write-then-read pane pattern (wezterm_pane_write does not return output)
- [x] #3 Instructions note wezterm_pane_list as the recommended first call to discover pane_id
- [x] #4 Instructions flag wezterm_pane_close as destructive/irreversible
- [x] #5 Instructions avoid duplicating existing tool description content per the article's anti-pattern guidance
- [ ] #6 Manually verified in an MCP client that supports server instructions (e.g. ask the agent 'does this server have special instructions?')
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added instructions field to the second Server() constructor arg (ServerOptions), alongside capabilities — confirmed via the MCP SDK's server/index.d.ts type. Kept to 3 sentences covering only cross-tool relationships not expressible in a single tool's description: write-then-read pattern, list-before-target discovery order, and close-is-destructive warning. AC #6 (manual verification in a live MCP client) still open — needs a client that surfaces server instructions.
<!-- SECTION:NOTES:END -->
