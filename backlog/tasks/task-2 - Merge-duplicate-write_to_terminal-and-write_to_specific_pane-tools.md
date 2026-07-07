---
id: TASK-2
title: Merge duplicate write_to_terminal and write_to_specific_pane tools
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:01'
updated_date: '2026-07-07 21:19'
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
- [x] #1 Only one write tool remains
- [x] #2 index.ts request handler updated to remove the duplicate case
- [x] #3 README tools table updated
- [x] #4 Tests updated to reflect the merged tool
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Removed write_to_specific_pane tool and writeToSpecificPane method — both were identical to write_to_terminal/writeToTerminal. Updated index.ts handler, README tools table, and all tests.
<!-- SECTION:NOTES:END -->
