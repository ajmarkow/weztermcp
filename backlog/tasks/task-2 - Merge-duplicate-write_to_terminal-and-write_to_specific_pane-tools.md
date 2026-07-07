---
id: TASK-2
title: Merge duplicate write_to_terminal and write_to_specific_pane tools
status: To Do
assignee: []
created_date: '2026-07-07 21:01'
labels:
  - mcp
  - cleanup
dependencies: []
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Both tools have identical schemas and behavior; duplicate capability is an anti-pattern per the guide.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Only one write tool remains
- [ ] #2 index.ts request handler updated to remove the duplicate case
- [ ] #3 README tools table updated
- [ ] #4 Tests updated to reflect the merged tool
<!-- AC:END -->
