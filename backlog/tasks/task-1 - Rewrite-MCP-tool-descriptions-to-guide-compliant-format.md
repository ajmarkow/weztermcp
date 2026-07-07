---
id: TASK-1
title: Rewrite MCP tool descriptions to guide-compliant format
status: To Do
assignee: []
created_date: '2026-07-07 21:01'
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
- [ ] #1 Each description has an **EXECUTION TOOL** prefix
- [ ] #2 Each description includes WHEN: with quoted trigger phrases
- [ ] #3 Each description leads with a unique action verb + domain
- [ ] #4 Each description is >=150 chars and <=60 words
- [ ] #5 Each description documents return context (e.g. write_to_terminal does not return output; split_pane returns new pane ID)
- [ ] #6 Each description states boundaries (what the tool does NOT do)
- [ ] #7 Each description includes one short canonical usage example
<!-- AC:END -->
