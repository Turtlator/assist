---
description: Move a repo's existing rules into the canonical `## Rules` sections
allowed_args: "[path to the repo or directory, defaults to cwd]"
---

You are migrating a repo's existing written rules into the canonical `## Rules` sections that `assist rules` reads, so they become citable from the comment panes. `$ARGUMENTS` names the repo or directory to work on; default to the cwd.

Assist reads exactly one thing: a `## Rules` heading whose body holds `- **<code>** — <text>` bullets. Rules written any other way — numbered lists, prose sections, bullets under a differently-named heading — are invisible to the rule picker no matter how well written they are. This command finds them and moves them.

## Step 1: Inventory

Find every `CLAUDE.md` in the repo:

```
git -C <repo> ls-files '**/CLAUDE.md' 'CLAUDE.md' 2>&1
```

Also check for untracked ones (`git status --short`) and mention any you find. Then, for each directory that has one, see what already parses:

```
assist rules list <dir> 2>&1
```

A directory that prints "No rules in scope" has nothing assist can read yet — that is what you are fixing.

## Step 2: Find the rule-like content

Read each `CLAUDE.md` in full. A rule is a standing instruction to whoever writes in that scope — something you could be told you broke. Look for:

- Numbered lists of directives ("Every rule comes from a transcript…", "Numbered lists only.")
- `- **<code>** — <text>` bullets already in rule form but under a heading that is not `## Rules`
- Short prose sections that state one standing instruction ("Never hard-wrap.", "Attribute each quote as…")

Not rules, and left alone: where files live, what a directory is for, source locations, epic and project background, worked examples, anything describing the repo rather than constraining what you write in it.

## Step 3: Classify each file

**Rename** — the section's bullets are already `- **<code>** — <text>` and the whole section is rules. Rename that heading to `## Rules`. Nothing else changes, and the existing codes are preserved. This is the cheapest and safest migration; prefer it whenever it applies.

**Reword** — the rules are prose or a numbered list. Word each as one short imperative line, then add them one at a time:

```
assist rules add '<rule text>' --scope <path to that CLAUDE.md> 2>&1
```

`rules add` allocates the next repo-wide code, creates the `## Rules` section when the file has none, and keeps the root index current. Then delete the prose you migrated, so the rule is not stated in two places. If a prose section carried context beyond the rule itself, keep the context where it is and take only the instruction.

**Leave** — the file has no standing rules. Say so and move on.

## Constraints

- Assist reads only the **first** `## Rules` heading in a file. Never create a second one; merge into the existing section instead.
- Only rename a heading when _every_ bullet under it is a rule and each already carries a `**code**`. If the section mixes rules with prose, treat it as a reword.
- Preserve existing codes on a rename. Never renumber — a code that has been cited must keep meaning the same rule.
- Never hand-write a new code. Codes are unique repo-wide, and `assist rules add` is what allocates them.
- Keep the author's wording wherever it already reads as a rule. You are moving rules, not rewriting them.
- Do not hard-wrap: one line per bullet.

## Step 4: Propose, then apply

Show the user the plan before touching anything: one line per file saying rename, reword (with the rules you would write) or leave. Ask for confirmation.

Then apply it **one file at a time**, showing what changed after each, so a wrong call is caught before it repeats across the repo.

## Step 5: Record and verify

Once the files are migrated, record the scoped directories in the root `CLAUDE.md`:

```
assist rules index <repo> 2>&1
```

A rename does not update that index by itself, so run this even if you only renamed headings. Then verify each scope reads back:

```
assist rules list <dir> 2>&1
```

Report what is now in scope where, and name anything you deliberately left behind and why.
