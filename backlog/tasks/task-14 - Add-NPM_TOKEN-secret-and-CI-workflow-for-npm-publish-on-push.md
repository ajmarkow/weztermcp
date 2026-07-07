---
id: TASK-14
title: Add NPM_TOKEN secret and CI workflow for npm publish on push
status: To Do
assignee: []
created_date: '2026-07-07 21:50'
labels:
  - ci
  - npm
dependencies:
  - TASK-12
  - TASK-13
priority: medium
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up GitHub Actions to run tests, build, and publish to npm on every push to main. Depends on package.json metadata and npm name being finalized (TASK-12, TASK-13).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 NPM_TOKEN secret added to GitHub repo settings
- [ ] #2 .github/workflows/publish.yml created: runs tests, builds, then publishes on push to main
- [ ] #3 Publish step only runs if tests pass
- [ ] #4 Version strategy decided: manual bump in package.json triggers publish, or automated patch bump in CI
- [ ] #5 README documents how to trigger a release
<!-- AC:END -->
