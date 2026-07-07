---
id: TASK-4
title: Rename tools to resource_action convention and decide namespacing
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:01'
updated_date: '2026-07-07 21:39'
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
- [x] #1 Tools renamed to resource_action (e.g. pane_write, pane_read, pane_list, pane_close, pane_split, pane_switch, pane_send_key)
- [x] #2 Decision recorded on whether a wezterm_ prefix is needed to avoid multi-server collisions
- [x] #3 index.ts, README, and tests updated for new names
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Renamed all 7 tools to wezterm_{resource}_{action} convention. Decision: wezterm_ prefix retained to prevent collisions when multiple MCP servers are loaded together. Updated index.ts tool names and switch cases, README table, and integration test comment. No internal method names changed — only the MCP-facing tool names.
<!-- SECTION:NOTES:END -->
