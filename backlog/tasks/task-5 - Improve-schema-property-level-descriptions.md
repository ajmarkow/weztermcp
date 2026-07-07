---
id: TASK-5
title: Improve schema property-level descriptions
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:01'
updated_date: '2026-07-07 21:40'
labels:
  - mcp
  - schema
dependencies: []
priority: medium
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Parameter descriptions lack formats and constraints per guide section 6.3.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 command property states whether a trailing newline is appended (executes vs types)
- [x] #2 All property descriptions include formats/constraints where relevant
- [x] #3 Defaults documented consistently in property descriptions
- [x] #4 Empty required:[] removed from list_panes schema
- [x] #5 Each tool has a human-readable title field
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Improved all property descriptions: command now states trailing \n is appended; character lists all 9 supported keys with their effects; direction documents case-sensitivity and visual layout; pane_id consistently says "Obtain from wezterm_pane_list"; lines documents default (50) and 0/negative behavior. Removed empty required:[] from wezterm_pane_list. Added title field to all 7 tools.
<!-- SECTION:NOTES:END -->
