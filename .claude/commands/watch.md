---
description: Watch for new commits on the remote and auto-build each time the branch moves
---

Watch this repo for new upstream commits and build them as they land.

Interval: `$ARGUMENTS` if given (e.g. `5m`), otherwise `2m`.

Set it up by invoking the `loop` skill with the interval followed by this prompt verbatim:

> In this repo: run `git fetch --quiet && git status -sb`. If the branch is behind the remote, run `git pull --ff-only`, then invoke the `/auto-build` skill and report the built version from `package.json`. If the pull is not a clean fast-forward, stop and report why instead of forcing, rebasing, or resetting anything. If the branch is up to date, say so in one line and do nothing else.

Then confirm the cadence and the job ID, and report the current version so there is a baseline to compare against.

## Why the pull is part of the loop

`auto-build` compiles the working tree — it does not fetch or pull. A watch that only fetches will detect new commits and then rebuild the same stale source indefinitely: the build passes, the version in the browser never changes, and the branch silently falls further behind. Detect-and-pull-then-build is the whole point.

## Reporting each iteration

State the version that was actually built, not just that the build passed. A passing build says nothing about which source it compiled.

When a pull brings in changes, say which processes need restarting before the change is visible:

- `src/commands/sessions/web/ui/` — restart the web server, then hard-reload the browser tab
- anything reached by the daemon — restart the daemon

If both changed, say both.
