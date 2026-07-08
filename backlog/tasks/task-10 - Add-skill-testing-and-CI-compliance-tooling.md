---
id: TASK-10
title: Add skill testing and CI compliance tooling
status: Done
assignee: []
created_date: '2026-07-07 21:02'
updated_date: '2026-07-08 16:52'
labels:
  - skill
  - ci
  - testing
dependencies:
  - TASK-8
priority: low
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Guide 4.8/10: token budgets, trigger tests, and frontmatter linting.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 .token-limits.json added documenting SKILL.md and references budgets
- [ ] #2 trigger_tests.yaml added with shouldTriggerPrompts and shouldNotTriggerPrompts
- [ ] #3 CI step lints skill frontmatter compliance (>=150 chars, has WHEN:, <=60 words)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Superseded along with task-8: no companion skill was built, so skill testing/CI compliance tooling (token budgets, trigger tests, frontmatter linting) doesn't apply. See task-9 (reworked).
<!-- SECTION:NOTES:END -->
