# Release Process

MiseOS uses Semantic Versioning and Conventional Commits.

## Release channels

- `0.x`: active platform development; breaking changes may occur in minor versions.
- stable releases: tagged `vMAJOR.MINOR.PATCH`.
- prereleases: `vMAJOR.MINOR.PATCH-rc.N`.

## Required release evidence

- `pnpm verify` succeeds.
- Catalog schema and ecosystem invariants succeed.
- Dependency and secret scans complete.
- Changelog entry exists.
- API or manifest breaking changes are identified.
- Container image builds from the release commit.

## Procedure

1. Create `release/vX.Y.Z`.
2. Update version fields and `CHANGELOG.md`.
3. Run `pnpm verify`.
4. Open a release pull request.
5. Merge after required checks and review.
6. Create signed or annotated tag `vX.Y.Z`.
7. GitHub Actions publishes the container and creates release notes.
8. Verify the image and release artifacts.

## Rollback

Do not rewrite release tags. Publish a patch release or revert commit, document the incident, and mark an unsafe artifact as deprecated where supported.
