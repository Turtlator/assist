---
description: Watch for new commits on the remote and auto-build each time the branch moves
---

Watch this repo for new upstream commits and build them as they land.

Run `assist watch wait --pull --timeout 60m` as a **background task**. It blocks until the current branch's upstream actually moves, so no agent turn runs while the branch is quiet — you are re-invoked when the process exits, not on a clock tick. Takes no arguments; ignore any that were passed.

Report the current version from `package.json` as a baseline, then stop. Do not poll the background task or do anything else while it runs.

When it exits, branch on the exit code:

- **0** — the upstream moved and was fast-forwarded. Invoke the `/auto-build` skill, report the built version, the commit table (see below) and the restarts the pull makes necessary, then run `assist watch wait --pull --timeout 60m` in the background again.
- **2** — the timeout elapsed with no movement. Say so in one line and run `assist watch wait --pull --timeout 60m` in the background again.
- **3** — the upstream moved but the pull was not a clean fast-forward. Stop watching and report git's reason. Do not force, rebase, or reset anything.
- **1** — waiting is impossible (no upstream, detached HEAD, not a repo). Stop watching and report the reason.
- **130** — interrupted. Stop watching.

## Why the pull is part of the wait

`auto-build` compiles the working tree — it does not fetch or pull. A watch that only detects movement will rebuild the same stale source indefinitely: the build passes, the version in the browser never changes, and the branch silently falls further behind. `--pull` is what makes detect-then-build mean anything.

## Reporting each build

State the version that was actually built, not just that the build passed. A passing build says nothing about which source it compiled.

Every time new commits land, show the last 10 commits as a markdown table. Get them with:

```
git log -10 --pretty=format:'%h%x09%ar%x09%s'
```

Render one row per commit with columns **SHA**, **When** (the relative time, e.g. `12 minutes ago`) and **Subject**, newest first. Mark the commits the pull just brought in — bold the SHA, or add a trailing `← new` — so it is obvious which rows are new versus already-built history.

When a pull brings in changes, say which processes need restarting before the change is visible:

- `src/commands/sessions/web/ui/` — restart the web server, then hard-reload the browser tab
- anything reached by the daemon — restart the daemon

If both changed, say both.
