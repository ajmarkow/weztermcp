---
id: TASK-14
title: Add NPM_TOKEN secret and CI workflow for npm publish on push
status: In Progress
assignee:
  - '@me'
created_date: '2026-07-07 21:50'
updated_date: '2026-07-07 23:08'
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
- [x] #2 .github/workflows/publish.yml created: runs tests, builds, then publishes on push to main
- [x] #3 Publish step only runs if tests pass
- [x] #4 Version strategy decided: manual bump in package.json triggers publish, or automated patch bump in CI
- [x] #5 README documents how to trigger a release
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created .github/workflows/publish.yml with two jobs: test (checkout, setup-node, npm ci/test/build) and publish (needs: test, only runs on push to main). Action versions verified against GitHub release API: actions/checkout@v7, actions/setup-node@v6, node-version 24.

Version strategy (AC4): manual bump. Publish step checks `npm view <name>@<version>` and only runs `npm publish` if that exact version is not already on the registry -- pushing to main without bumping package.json version is a no-op for publishing.

README updated with a Releasing section (AC5).

Secret name (AC1): uses INFISICAL_NPM_TOKEN rather than NPM_TOKEN -- user is setting this up via Infisical's GitHub secrets sync integration rather than a manually-set gh secret. Workflow references secrets.INFISICAL_NPM_TOKEN. Confirmed via gh secret list that it is not yet present as of this note; will populate once the Infisical integration is configured on the user's end.
<!-- SECTION:NOTES:END -->
