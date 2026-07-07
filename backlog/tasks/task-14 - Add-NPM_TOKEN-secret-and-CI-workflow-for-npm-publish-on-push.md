---
id: TASK-14
title: Add NPM_TOKEN secret and CI workflow for npm publish on push
status: In Progress
assignee:
  - '@me'
created_date: '2026-07-07 21:50'
updated_date: '2026-07-07 23:05'
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
Created .github/workflows/publish.yml with two jobs: test (checkout, setup-node, npm ci/test/build) and publish (needs: test, only runs on push to main). Action versions verified against GitHub release API at implementation time: actions/checkout@v7, actions/setup-node@v6, node-version 24 (per setup-node docs recommendation for OIDC/modern npm).

Version strategy (AC4): manual bump. Publish step checks `npm view <name>@<version>` and only runs `npm publish` if that exact version is not already on the registry -- so pushing to main without bumping package.json version is a no-op for publishing, avoiding duplicate-publish failures. To release: bump version in package.json, commit, push to main.

README updated with a Releasing section documenting this flow (AC5).

AC1 (NPM_TOKEN secret) NOT completed -- I do not have npm publish credentials and cannot generate/set this secret myself. Confirmed via `gh secret list` that no NPM_TOKEN exists yet. User needs to generate an npm access token (npm.im token create, publish-scoped) and either add it via GitHub repo Settings > Secrets and variables > Actions, or provide it for `gh secret set NPM_TOKEN` to be run. Workflow will fail at the publish step until this is set.
<!-- SECTION:NOTES:END -->
