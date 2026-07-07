---
id: TASK-6
title: Add security risk documentation and destructive-command safeguards
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:01'
updated_date: '2026-07-07 22:56'
labels:
  - security
  - docs
dependencies: []
priority: high
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
This server executes arbitrary text in a live terminal, the highest-risk tool category (guide 8.3).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README documents the risk model (agent can run any shell command in any pane)
- [x] #2 write_to_terminal and close_pane descriptions instruct the agent to confirm before destructive commands
- [x] #3 Tool failures return meaningful error messages instead of crashing silently
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added a Security section to README documenting the risk model: any connected agent can run arbitrary shell commands in any pane with the user's full permissions, no sandboxing/allowlisting exists, and confirmation guidance in tool descriptions is advisory only. Added SECURITY: lines to wezterm_pane_write and wezterm_pane_close descriptions instructing the agent to confirm before destructive/irreversible actions. Verified all tool failures already return descriptive error text via try/catch (send_control_character throws instead of returning, but the MCP SDK converts thrown errors into proper JSON-RPC error responses with the message intact -- not a silent failure).
<!-- SECTION:NOTES:END -->
