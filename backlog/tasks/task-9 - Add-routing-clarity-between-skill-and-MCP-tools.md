---
id: TASK-9
title: >-
  Strengthen MCP server instructions and tool descriptions in lieu of a
  companion skill
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:02'
updated_date: '2026-07-08 16:57'
labels:
  - mcp
  - docs
dependencies:
  - TASK-7
priority: medium
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
task-7's eval found no failure modes using the MCP tools directly with a real WezTerm client, so task-8's companion skill was superseded — per user decision, further orchestration guidance for multi-step workflows (e.g. run-tests-in-split-pane, monitor-long-running-process, interactive-REPL patterns) should be captured within the MCP server boundary: the server-level instructions field (src/index.ts) and individual tool descriptions, not a separate skill artifact.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Review whether the current instructions field and tool descriptions already cover common multi-step patterns (split-pane test runs, monitoring, REPL sessions) or need additions
- [x] #2 Add any missing cross-tool guidance to the instructions field or relevant tool descriptions, keeping additions concise per the anti-duplication guidance already applied in task-15
- [x] #3 README reflects any new guidance if it changes how users should expect the server to behave
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Reviewed the instructions field and all tool descriptions against the three original eval scenarios (split-pane test run, long-running process monitoring, REPL session). Write-then-read, list-before-target, and destructive-close were already covered. One real gap: nothing told the agent that wezterm_pane_read is a snapshot, not a blocking wait — for a long-running process it needs to call read again later rather than assume one read captures final output. Added one sentence to the instructions field for this. No README change needed since the README doesn't document instructions-field content verbatim and user-facing behavior didn't change.
<!-- SECTION:NOTES:END -->
