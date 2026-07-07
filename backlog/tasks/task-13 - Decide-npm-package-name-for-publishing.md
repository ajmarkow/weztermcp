---
id: TASK-13
title: Decide npm package name for publishing
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:50'
updated_date: '2026-07-07 23:03'
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
- [x] #1 Check if 'wezterm-mcp' is available on npm or taken by upstream
- [x] #2 Decide between scoped (@ajmarkow/weztermcp) or unscoped (e.g. weztermcp) name
- [x] #3 package.json name field updated to chosen name
- [x] #4 bin key and README install instructions updated to match
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Decision: unscoped "weztermcp" (no hyphen), completed as part of TASK-12.

Rationale:
- Confirmed "wezterm-mcp" is owned by upstream (hiraishikentaro/wezterm-mcp, published on npm).
- Confirmed "weztermcp" (unscoped, no hyphen) is unclaimed on npm.
- Chose unscoped over @ajmarkow/weztermcp per user preference (server name "weztermcp" was already set without an author-scoped prefix, and scoping isn't needed since the name is available outright).

package.json name, bin key, and README install snippet were all updated to "weztermcp" in TASK-12.
<!-- SECTION:NOTES:END -->
