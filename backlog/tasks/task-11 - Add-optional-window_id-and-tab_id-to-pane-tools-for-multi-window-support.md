---
id: TASK-11
title: Add optional window_id and tab_id to pane tools for multi-window support
status: To Do
assignee: []
created_date: '2026-07-07 21:43'
labels:
  - mcp
  - multi-window
dependencies: []
priority: medium
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
All tools currently assume a single WezTerm window and tab. Users with multiple windows or tabs cannot target panes across them reliably. Tools that enumerate or operate on panes should accept optional window_id and tab_id parameters, falling back to the active focused window/tab when omitted.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 wezterm_pane_list accepts optional window_id and tab_id to scope the listing
- [ ] #2 wezterm_pane_write, wezterm_pane_read, wezterm_pane_send_key, wezterm_pane_switch, wezterm_pane_close, wezterm_pane_split all continue to target by pane_id (which is globally unique in WezTerm) — confirm no window/tab scoping needed for these
- [ ] #3 wezterm_pane_split accepts optional window_id and tab_id to control where the new pane is created
- [ ] #4 Default behaviour (no window_id/tab_id) uses the active focused window and tab
- [ ] #5 Schema property descriptions document the default fallback behaviour
- [ ] #6 README updated to note multi-window/tab support
- [ ] #7 Tests cover the explicit window_id/tab_id path and the default fallback path
<!-- AC:END -->
