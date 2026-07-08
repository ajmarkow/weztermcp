---
id: TASK-11
title: Add optional window_id and tab_id to pane tools for multi-window support
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:43'
updated_date: '2026-07-08 02:43'
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
- [x] #1 wezterm_pane_list accepts optional window_id and tab_id to scope the listing
- [x] #2 wezterm_pane_write, wezterm_pane_read, wezterm_pane_send_key, wezterm_pane_switch, wezterm_pane_close, wezterm_pane_split all continue to target by pane_id (which is globally unique in WezTerm) — confirm no window/tab scoping needed for these
- [x] #3 wezterm_pane_split accepts optional window_id and tab_id to control where the new pane is created
- [x] #4 Default behaviour (no window_id/tab_id) uses the active focused window and tab
- [x] #5 Schema property descriptions document the default fallback behaviour
- [x] #6 README updated to note multi-window/tab support
- [x] #7 Tests cover the explicit window_id/tab_id path and the default fallback path
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
wezterm_pane_list and wezterm_pane_split now accept optional window_id/tab_id. Since wezterm's split-pane CLI has no native window/tab flags and list has no active-pane field, resolution is done client-side: wezterm cli list --format json gives window_id/tab_id/pane_id per pane, and wezterm cli list-clients --format json gives focused_pane_id. WeztermExecutor.resolveTargetPaneId() cross-references these to find the focused pane, optionally narrowed to a given window_id/tab_id scope, falling back to the first pane in scope if the focused pane is outside it. listPanes() defaults to the focused window/tab (previously listed everything); explicit window_id/tab_id override. splitPane()'s pane_id is now optional and resolved the same way. Tests written first covering: explicit scoping, default focus-based scoping, no-focused-client fallback (list everything), empty-scope friendly message, and splitPane's pane resolution (focused-in-scope, focused-out-of-scope falls back to first match, and unresolvable-pane error).
<!-- SECTION:NOTES:END -->
