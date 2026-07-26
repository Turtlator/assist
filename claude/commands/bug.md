---
description: File a bug with reproduction steps, expected and actual behavior
allowed_args: "[short description of the bug]"
---

You are helping the user file a bug report as a backlog item. Your goal is to extract the minimum information needed: what happens, what should happen, and how to reproduce it.

## Step 1: Understand the bug

If the user provided a description via $ARGUMENTS, use that as a starting point. Otherwise, ask what's going wrong.

## Step 2: Gather details

Ask short, targeted questions one at a time to fill in any gaps. You need three things:

1. **Reproduction steps** — what does the user do to trigger the bug?
2. **Expected behavior** — what should happen?
3. **Actual behavior** — what happens instead?

Before asking the user about existing functionality — how a feature currently works, what a command does, where something lives — investigate the codebase first and answer it yourself. Do this investigation yourself — do not delegate it to a sub-agent; you need the context in your own working memory to write an accurate bug report. Only ask the user about things the code can't tell you (their intent, what they observed, how to reproduce it).

Skip questions the user has already answered. Stop asking as soon as you have enough to write a clear bug report — don't over-interrogate.

## Step 3: Propose the item

Where the review happens depends on whether this is a web session — check it once:

```
echo "${ASSIST_SESSION:-0}"
```

- **`1` (web session):** do NOT print the bug report in the terminal. Skip straight to Step 5 — `assist backlog propose` slides the item into the web UI preview pane, where the user approves it, rejects it, or leaves inline comments on specific lines. That pane is the review gate.
- **anything else:** show the user the bug report in chat as below, iterate (Step 4), then save.

Either way you compose the same content, so draft it before you call `propose`:

**Name:** (concise title)
**Type:** bug
**Description:**
**Repro:** (numbered steps)
**Expected:** ...
**Actual:** ...

**Acceptance Criteria:**

- (conditions that confirm the bug is fixed)

Do NOT generate a plan — the implementer will determine how to fix it.

### Writing the description

The description renders as markdown in both the terminal (`assist backlog show`) and the web UI, so author it as structured markdown — never a single run-on prose paragraph. Use bold section labels or `##` headings, a numbered list for the repro steps, and short paragraphs for Expected/Actual:

```markdown
**Repro:**

1. Step one
2. Step two

**Expected:** what should happen.

**Actual:** what happens instead.
```

## Step 4: Iterate

In a web session, skip this step — the preview pane handles it.

Otherwise, ask the user if they want to change anything and iterate until they confirm.

## Step 5: Save

Propose the item and capture the id it prints. Use `propose`, not `assist backlog add` — `propose` is the reviewed path for an agent-authored item:

```
cat <<'JSON' | assist backlog propose --json - 2>&1
{
  "name": "Bug title",
  "type": "bug",
  "description": "**Repro:**\n\n1. ...\n2. ...\n\n**Expected:** ...\n\n**Actual:** ...",
  "acceptanceCriteria": ["criterion 1", "criterion 2"]
}
JSON
```

The payload is strict JSON — an unknown key is an error. `\n` inside the `description` string is a JSON escape and becomes a real newline, which is what the markdown rendering needs.

In a web session this blocks until the user decides in the preview pane, and the review can take far longer than the default command timeout. Run `propose` **as a background task** so it is never killed mid-review, and do no other work until it returns — the pending preview dies with the process, so a killed `propose` abandons the item.

When it returns:

- **Approved** — the item is created and its id is printed.
- **Rejected** — the command exits non-zero and prints the reason plus every inline comment with the excerpt it was left on. Do not retry verbatim: address each comment, then call `propose` again with the revised payload. Repeat until it is approved.

Outside a web session the rendered item is printed and created straight away.

Note the created item id from the output — you'll pass it to the done signal below.

### Associate an external tracker

If an external tracker was referenced anywhere in the conversation leading to this bug — whether in `$ARGUMENTS` or supplied at any point during the discussion — associate it with the created item so downstream sessions have the context. Detect at most **one** tracker:

- A **Jira** issue — a bare key (`PROJ-123`) or an Atlassian browse URL (`https://<site>.atlassian.net/browse/PROJ-123`):

  ```
  assist backlog associate-jira a<id> "<key-or-url>" 2>&1
  ```

- A **GitHub** issue — `owner/repo#number` shorthand or a `https://github.com/owner/repo/issues/N` URL:

  ```
  assist backlog associate-github a<id> "<issue-or-url>" 2>&1
  ```

Only one external tracker can be set per item (associating one clears the other), so run at most one of these. If no tracker was referenced, skip this step. If the association command reports an error (malformed reference, issue not found), relay it to the user but do not treat it as fatal — the item was still created successfully.

### Attach a referenced Slack thread

If a Slack thread was referenced anywhere in the conversation leading to this bug — a `slack.com` archives/permalink URL (e.g. `https://<workspace>.slack.com/archives/C.../p...`), whether in `$ARGUMENTS` or supplied at any point during the discussion — attach it to the created item so it renders as a linked Slack row in the Activity section:

```
assist backlog add-activity a<id> slack "<permalink>" --url "<permalink>" --title "Bug title" 2>&1
```

Use the same permalink verbatim for both the ref and `--url`, and the item's name for `--title`. If no Slack thread was referenced, skip this step.

Then show the user the item was created and suggest they can run `assist backlog run a<id>` to start implementation.

Finally, signal that the bug-filing task is complete, passing the created item id (a-prefixed, e.g. `a555`):

```
assist signal done a<id> 2>&1
```

This lets a wrapping `assist bug --once` session end and surfaces the created item id to the session card; in a plain interactive session it has no effect.
