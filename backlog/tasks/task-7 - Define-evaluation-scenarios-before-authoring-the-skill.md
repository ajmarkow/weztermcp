---
id: TASK-7
title: Define evaluation scenarios before authoring the skill
status: Done
assignee: []
created_date: '2026-07-07 21:02'
updated_date: '2026-07-08 16:52'
labels:
  - skill
  - eval
dependencies: []
priority: high
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Guide 4.1: evaluation-first. Test the agent on real multi-step terminal tasks without guidance, then document only what it gets wrong.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Eval scenarios defined for representative multi-step tasks (run tests in split pane, monitor long-running process, interactive REPL session)
- [x] #2 Agent run against scenarios without a skill to identify failure modes
- [x] #3 Documented gaps feed the skill content
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Ran broader general dev-workflow tasks against a real WezTerm client (build/test runs, output checks, switching between panes for different purposes) rather than strictly the three originally scoped scenarios (split-pane test run, long-running process monitoring, interactive REPL). All tools worked as expected — no failure modes found, so there are no gaps to feed into skill content. Per user decision, this means TASK-8/9/10 (companion skill) are being replaced: further improvements should live as MCP server instructions/tool descriptions, not a separate skill artifact — see task-9 (reworked).
<!-- SECTION:NOTES:END -->
