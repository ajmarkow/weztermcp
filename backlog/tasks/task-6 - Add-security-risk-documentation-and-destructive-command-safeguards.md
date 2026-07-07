---
id: TASK-6
title: Add security risk documentation and destructive-command safeguards
status: To Do
assignee: []
created_date: '2026-07-07 21:01'
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
- [ ] #1 README documents the risk model (agent can run any shell command in any pane)
- [ ] #2 write_to_terminal and close_pane descriptions instruct the agent to confirm before destructive commands
- [ ] #3 Tool failures return meaningful error messages instead of crashing silently
<!-- AC:END -->
