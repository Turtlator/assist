---
description: Resolve the current PR branch's merge conflicts against the remote default
---

Resolve the conflicts between this branch and the remote default branch, then push.

The branch is already checked out — `assist fix-conflict <number>` checks the PR out before launching this session. Never switch branches.

## Step 1: Find the remote default branch

```
git remote show origin | sed -n 's/.*HEAD branch: //p'
```

Call the result `<default>`. If it comes back empty, fall back to `git symbolic-ref --short refs/remotes/origin/HEAD` and strip the `origin/` prefix.

## Step 2: Fetch and merge

```
git fetch origin
git merge origin/<default>
```

If the merge reports "Already up to date" or completes cleanly with no conflicts, there is nothing to resolve — say so and stop. Do not push, do not create an empty commit.

## Step 3: Resolve every conflicted file

List the conflicts with `git diff --name-only --diff-filter=U`, then work through them one at a time:

1. Read the file and understand both sides. `git log --oneline origin/<default>..HEAD` and `git log --oneline HEAD..origin/<default>` show what each side changed and why.
2. Write the resolution that keeps **both** intents. A conflict usually means two changes to the same region, not a choice between them — only drop a side when it is genuinely superseded.
3. Remove every conflict marker (`<<<<<<<`, `=======`, `>>>>>>>`).
4. `git add <file>`.

Handle the non-text cases explicitly:

- **Lock files** (`package-lock.json`, `pnpm-lock.yaml`): do not hand-merge. Take the default branch's version (`git checkout --theirs <file>`), then regenerate it with the project's install command and `git add` the result.
- **Delete/modify conflicts**: decide whether the deletion or the modification wins from the two logs, then `git rm <file>` or `git add <file>`.

Repeat until `git diff --name-only --diff-filter=U` is empty. Confirm no markers survived:

```
git grep -n '^<<<<<<< \|^>>>>>>> ' -- . || true
```

## Step 4: Verify

Run `/verify`. Fix anything it reports — a merge that compiles on each side can still break where the two changes meet, so treat failures as part of the conflict resolution rather than pre-existing breakage.

Do not proceed to Step 5 until verify passes.

## Step 5: Commit and push

```
git commit --no-edit
git push
```

`--no-edit` keeps git's generated merge message. Do not use `/commit` here — this is a merge commit, not a feature commit.

Report the resolved files and the pushed SHA when done.

## Important

- Never `git merge --abort` or reset without being asked — the user launched this session to get the conflicts resolved.
- Never force-push on the merge strategy; a plain `git push` is correct because the merge only adds a commit.
- If a conflict genuinely cannot be resolved without a product decision, stop and ask the user rather than guessing.
