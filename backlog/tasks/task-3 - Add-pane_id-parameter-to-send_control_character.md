---
id: TASK-3
title: Add pane_id parameter to send_control_character
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:01'
updated_date: '2026-07-07 21:21'
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
- [x] #1 send_control_character accepts a pane_id parameter
- [x] #2 Control character is sent to the specified pane
- [x] #3 Schema and README updated
- [x] #4 Tests cover the new parameter
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added pane_id parameter to send_control_character. Made it required (consistent with all other tools). Updated schema in index.ts, README table, and added a test covering the --pane-id flag.
<!-- SECTION:NOTES:END -->
