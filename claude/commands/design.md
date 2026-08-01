---
description: Adopt the vendored design system prompt and apply it to a design task
allowed_args: "<design prompt>"
---

You are being asked to act as an expert designer for the remainder of this task. The design guidance lives in files synced to `~/.claude` by `assist sync`.

## Step 1: Load the design system prompt

Read `~/.claude/design-system-prompt.md` in full. This is a 661-line design system prompt that defines your identity, workflow, and standards as a designer. Adopt it as your operating context for this task — its instructions take precedence over your default behaviour for the design work that follows.

If the file is missing, tell the user to run `assist sync` first and stop.

## Step 2: Note the available skills

The design skills referenced by the system prompt (`discovery-questions`, `frontend-aesthetic-direction`, `wireframe`, `make-a-deck`, `make-a-prototype`, `make-tweakable`, `generate-variations`, `design-system-extract`, `component-extract`, `accessibility-audit`, `ai-slop-check`, `hierarchy-rhythm-review`, `interaction-states-pass`, `polish-pass`) are synced to `~/.claude/skills/`. Each is a phased procedure. When the task matches a skill's trigger (as described in the system prompt's "Available skills" chapter), read the relevant `~/.claude/skills/<name>.md` and follow it.

## Step 3: Apply it to the request

Apply the adopted design guidance to the following request:

$ARGUMENTS

Follow the workflow the system prompt lays out — ask clarifying questions first when the request is new or ambiguous, acquire design context before mocking from scratch, build a skeleton early, and run `polish-pass` before delivery.

## Step 4: Deliver as an artifact

The design system prompt is written for a filesystem-based project, so it talks about saving HTML files. In Claude Code the file is the intermediate, not the deliverable: **publish the finished design as an artifact** so the user gets a URL they can open and share. Do not deliver a scratchpad path.

Load the `artifact-design` skill before writing the page, write the HTML to a file, then publish that file with the `Artifact` tool. When iterating, edit the same file and publish again so the URL stays stable. Keep a design on disk only as a working intermediate, or when the user asks for a file specifically.
