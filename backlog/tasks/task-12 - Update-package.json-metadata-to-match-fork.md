---
id: TASK-12
title: Update package.json metadata to match fork
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:49'
updated_date: '2026-07-07 23:03'
labels:
  - npm
  - metadata
dependencies: []
priority: high
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
package.json still references the upstream author, repo URL, homepage, and bugs URL (hiraishikentaro/wezterm-mcp). These need updating to reflect the ajmarkow/weztermcp fork before the package can be published.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 name field updated (decide on scoped @ajmarkow/weztermcp vs unscoped)
- [x] #2 author field updated to AJ Markow
- [x] #3 repository.url updated to github.com/ajmarkow/weztermcp
- [x] #4 homepage updated to github.com/ajmarkow/weztermcp
- [x] #5 bugs.url updated to github.com/ajmarkow/weztermcp/issues
- [x] #6 bin key updated if package name changes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Updated package.json name to "weztermcp" (unscoped, confirmed available on npm; upstream "wezterm-mcp" is taken). Updated author to AJ Markow, repository/homepage/bugs URLs to github.com/ajmarkow/weztermcp, and bin key to match the new name. Updated README install snippet to match; removed the upstream Smithery install section since that listing does not exist for this fork. Also fixed a pre-existing build bug: wezterm_check imports needed .js extensions for tsc (Node16 module resolution) but that broke Jest resolution against .ts sources -- added a moduleNameMapper to jest.config.js to strip .js on relative imports during test resolution. Verified both npm run build and npm test pass.
<!-- SECTION:NOTES:END -->
