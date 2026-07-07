---
id: TASK-3
title: Add pane_id parameter to send_control_character
status: To Do
assignee: []
created_date: '2026-07-07 21:01'
labels:
  - mcp
  - consistency
dependencies: []
priority: medium
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
send_control_character only targets the active pane, inconsistent with every other tool which takes pane_id.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 send_control_character accepts a pane_id parameter
- [ ] #2 Control character is sent to the specified pane
- [ ] #3 Schema and README updated
- [ ] #4 Tests cover the new parameter
<!-- AC:END -->
