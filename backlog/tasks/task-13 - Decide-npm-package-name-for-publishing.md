---
id: TASK-13
title: Decide npm package name for publishing
status: To Do
assignee: []
created_date: '2026-07-07 21:50'
labels:
  - npm
  - naming
dependencies: []
priority: high
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current package name 'wezterm-mcp' is taken by the upstream package on npm. A new name is needed before CI publish can be set up.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Check if 'wezterm-mcp' is available on npm or taken by upstream
- [ ] #2 Decide between scoped (@ajmarkow/weztermcp) or unscoped (e.g. weztermcp) name
- [ ] #3 package.json name field updated to chosen name
- [ ] #4 bin key and README install instructions updated to match
<!-- AC:END -->
