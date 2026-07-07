---
id: TASK-4
title: Rename tools to resource_action convention and decide namespacing
status: To Do
assignee: []
created_date: '2026-07-07 21:01'
labels:
  - mcp
  - naming
dependencies: []
priority: medium
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tools use mixed naming; guide recommends resource_action, and {platform}_{resource}_{action} for multi-server hosts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tools renamed to resource_action (e.g. pane_write, pane_read, pane_list, pane_close, pane_split, pane_switch, pane_send_key)
- [ ] #2 Decision recorded on whether a wezterm_ prefix is needed to avoid multi-server collisions
- [ ] #3 index.ts, README, and tests updated for new names
<!-- AC:END -->
