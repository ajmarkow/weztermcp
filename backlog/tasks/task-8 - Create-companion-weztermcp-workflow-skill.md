---
id: TASK-8
title: Create companion weztermcp workflow skill
status: To Do
assignee: []
created_date: '2026-07-07 21:02'
labels:
  - skill
dependencies:
  - TASK-7
priority: high
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Guide core pattern: skills orchestrate the HOW, MCP tools execute the WHAT. No companion skill exists today.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 skills/weztermcp/SKILL.md created for orchestrating multi-step terminal sessions
- [ ] #2 Frontmatter has **WORKFLOW SKILL** prefix, WHEN: triggers, INVOKES: listing MCP tools, and FOR SINGLE OPERATIONS: bypass guidance
- [ ] #3 Body includes an MCP Tools Used table mapping steps to tools
- [ ] #4 SKILL.md is under 500 tokens (soft limit)
- [ ] #5 references/ subdirectory added with workflow recipes (run-tests, multi-pane-session)
<!-- AC:END -->
