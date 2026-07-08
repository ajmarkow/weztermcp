---
id: TASK-14
title: Add CI workflow for npm publish on push via trusted publishing
status: Done
assignee:
  - '@me'
created_date: '2026-07-07 21:50'
updated_date: '2026-07-08 01:33'
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
- [x] #1 .github/workflows/publish.yml created: runs tests, builds, then publishes on push to main
- [x] #2 Publish step only runs if tests pass
- [x] #3 Version strategy decided: manual bump in package.json triggers publish, or automated patch bump in CI
- [x] #4 README documents how to trigger a release
- [ ] #5 weztermcp package configured on npmjs.com with this repo's publish.yml as a Trusted Publisher
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Switched from a manually-provisioned npm token secret to npm trusted publishing (OIDC). The publish job now sets id-token: write and runs npm publish --provenance with no NODE_AUTH_TOKEN — npm CLI negotiates a short-lived OIDC token with the registry directly. Requires configuring this repo's publish.yml as a Trusted Publisher for the weztermcp package on npmjs.com (Package Settings > Trusted Publisher); no GitHub secret needed at all.

weztermcp@0.1.0 published manually to bootstrap the package, then trusted publisher configured via: npm trust github weztermcp --repo ajmarkow/weztermcp --file publish.yml --allow-publish. Verified with npm trust list weztermcp (id: c104a589-be2a-43f4-9b43-1fb2f8b672ee). Note: the nix-managed global npm (11.12.1) ships trust command docs but not a working implementation; used npx npm@latest to run trust commands.
<!-- SECTION:NOTES:END -->
