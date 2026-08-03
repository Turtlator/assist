# Codex harness gaps

Running notes on where the Codex CLI differs from Claude Code in ways that
affect `assist`, and how much each one hurts. Added as part of making Codex a
first-class harness (backlog `a667`). Verified against `codex-cli 0.133.0`.

Severity reflects impact on our workflows, not Codex's roadmap.

## Backlog run sandbox

`assist backlog run <id> --harness codex` launches Codex with
`--sandbox workspace-write` by default. Passing `--no-write` launches it with
`--sandbox read-only`; an explicit `--write` selects `workspace-write`.

| Gap                                     | Severity   | Impact on us                                                                                                                                                                                                                                                                                                     | Mitigation / workaround                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No command auto-approval classifier** | High       | Codex has no equivalent to Claude Code's built-in safe-command classifier, so it prompts for approval on commands Claude would auto-run. Without help, every tool call in a tracked Codex session stalls on approval.                                                                                            | `assist codex-hook` (a `PreToolUse`/`PermissionRequest` hook, synced into `~/.codex/config.toml`) auto-approves our read-only allowlist — the same allowlist the Claude `cli-hook` uses. Residual: anything outside the allowlist still prompts.                                                                                                                            |
| **Hooks must be trusted per machine**   | Low–Medium | A hook registered in `config.toml` is _configured but untrusted_; Codex refuses to run it until it has been trusted interactively once, and stores that trust in its per-machine sqlite state DB. So `assist codex-hook` requires a one-time "trust this hook?" approval on the first Codex run on each machine. | One-time and self-healing (persists after approval; re-prompts only if the hook command string changes). No supported way to pre-seed trust: `hooks_trust` / `trust_all_hooks` config keys are rejected, and inline `trusted` / `trusted_hash` on the handler are silently ignored. The launch-only escape hatch is `--dangerously-bypass-hook-trust` (not currently used). |
| **No user-defined slash commands**      | Low        | Codex CLI has no `/name` custom-command mechanism (file-based `/prompts:<name>` is ChatGPT-desktop only). Our synced commands can't be invoked as `/refine` the way they are under Claude.                                                                                                                       | Commands are synced as Codex _skills_ (`~/.codex/skills/<name>/SKILL.md`) and invoked by name — `$refine` or plain text matching the skill description. Verified working.                                                                                                                                                                                                   |

## Resuming a Codex session

`codex resume [SESSION_ID|name] [PROMPT]` takes an explicit UUID (with `--last`,
`--all` and a sibling `codex fork`), and its optional prompt is the equivalent of
the resume nudge we pass Claude — so resume needs no workaround. The one thing
Codex has no flag for is pre-assignment: Codex mints the id itself, so there is
no `--session-id` to fix up front the way `spawnClaude` does, and a launched
session has no id to record until we look it up.

Two ways to look it up, both against `codex-cli 0.145.0`:

1. **Rollout file on disk (primary).** Every session writes
   `~/.codex/sessions/YYYY/MM/DD/rollout-<ISO-8601>-<session_id>.jsonl`, whose
   first line is a `session_meta` record carrying `session_id`, `cwd`,
   `originator` (`codex-tui` for the TUI the daemon spawns, `codex_exec` for
   `codex exec`), `cli_version` and `timestamp`. Matching on cwd plus a
   spawn-time window resolves the id with no unsupported flags, and the same file
   is the transcript for history and the token source for usage. `codex exec`
   additionally prints `session id: <uuid>` in its header; the TUI does not.
2. **Hook payload (secondary).** Codex hook input carries `session_id`,
   `turn_id`, `transcript_path` and `cwd`, and the event list includes
   `SessionStart`/`SessionEnd`, so `assist codex-hook` could report the id via
   the activity file on the first event. Unverified end-to-end here: hooks did
   not fire in an isolated `CODEX_HOME` test, and trust is per-machine, so this
   is a follow-up rather than the load-bearing path.

Route 1 is what the daemon's Codex resume path is built on: resolve the id after
spawn, record it like any other conversation id, then `codex resume <id> "<nudge>"`
for restart and restore.

## Hook wire contract (for reference)

Verified against the current Codex hook contract. `assist codex-hook` emits
these shapes:

- **PreToolUse** — allow: no output, so Codex continues to its permission flow; deny: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"…"}}`.
- **PermissionRequest** — `{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"|"deny","message":"…"}}}`.
- Unrecognised command → no output, so Codex falls through to its normal approval flow.

Codex mirrors Claude's hook input schema (`hook_event_name`, `tool_name`,
`tool_input.command`, `tool_use_id`), which is why the same allowlist logic
serves both harnesses.
