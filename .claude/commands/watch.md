---
description: Watch for new commits on the remote and auto-build each time the branch moves
---

Watch this repo for new upstream commits and build them as they land.

Run `assist watch wait --pull --build` as a **background task**. It blocks until the current branch's upstream actually moves, then pulls, prints the build report and builds — so no agent turn runs while the branch is quiet. You are re-invoked when the process exits, not on a clock tick. Takes no arguments; ignore any that were passed.

Say you are watching, then stop. Do not poll the background task or do anything else while it runs.

When it exits, branch on the exit code:

- **0** — the upstream moved, was fast-forwarded and built. Echo the command's report verbatim, then run `assist watch wait --pull --build` in the background again.
- **4** — the build failed. Report the build output, then run `assist watch wait --pull --build` in the background again.
- **3** — the branch has genuinely diverged (local commits not on the remote, a rebase or merge in progress, conflicts). Report git's reason and stop. Never force or reset.
- **1** — cannot wait at all (no upstream, detached HEAD, not a repo). Stop.
- **130** — user interrupt. Stop. A killed or torn-down task is not an interrupt — start a new wait.

## Why the pull is part of the wait

`auto-build` compiles the working tree — it does not fetch or pull. A watch that only detects movement will rebuild the same stale source indefinitely: the build passes, the version in the browser never changes, and the branch silently falls further behind. `--pull` is what makes detect-then-build mean anything.
