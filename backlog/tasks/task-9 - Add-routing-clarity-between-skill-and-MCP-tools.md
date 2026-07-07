---
id: TASK-9
title: Add routing clarity between skill and MCP tools
status: To Do
assignee: []
created_date: '2026-07-07 21:02'
labels:
  - skill
  - mcp
  - routing
dependencies:
  - TASK-8
priority: medium
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
LLM needs signals for when to escalate from a single tool op to the workflow skill (guide sections 3-5).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each MCP tool description includes FOR FULL WORKFLOW: Use weztermcp skill
- [ ] #2 Skill WHEN: triggers are distinctive enough that single-op requests (e.g. list my panes) route to tools directly
- [ ] #3 README documents which requests route to the skill vs tools directly
<!-- AC:END -->
