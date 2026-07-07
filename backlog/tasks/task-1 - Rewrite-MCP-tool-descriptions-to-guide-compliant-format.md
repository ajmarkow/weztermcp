---
id: TASK-1
title: Rewrite MCP tool descriptions to guide-compliant format
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:01'
updated_date: '2026-07-07 21:24'
labels:
  - mcp
  - descriptions
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
All 8 tool descriptions are too terse and lack routing signals per the Skills+MCP guide.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Each description has an **EXECUTION TOOL** prefix
- [x] #2 Each description includes WHEN: with quoted trigger phrases
- [x] #3 Each description leads with a unique action verb + domain
- [x] #4 Each description is >=150 chars and <=60 words
- [x] #5 Each description documents return context (e.g. write_to_terminal does not return output; split_pane returns new pane ID)
- [x] #6 Each description states boundaries (what the tool does NOT do)
- [x] #7 Each description includes one short canonical usage example
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Rewrote all 7 tool descriptions in index.ts to follow the Skills+MCP guide format: EXECUTION TOOL prefix, WHEN: trigger phrases, unique action verb, return context, explicit boundaries, and a usage example. All descriptions >=150 chars and <=60 words.
<!-- SECTION:NOTES:END -->
