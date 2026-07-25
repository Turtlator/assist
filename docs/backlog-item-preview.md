# Backlog item preview

Agent-authored backlog items go through the same human gate as agent-authored PRs: the proposed item is rendered into the web UI preview pane, the reviewer approves or comments on it, and only an approval writes anything to the backlog.

## Why

`assist prs raise` already forces an agent through a review gate — a `pr-preview` message, a slide-in pane with drag-select inline commenting, and a non-zero exit carrying the reviewer's comments back so the agent revises and re-previews.

Backlog item creation had no equivalent. `/draft` and `/bug` printed the proposed item into the terminal, took confirmation in chat, then wrote it with `assist backlog add` followed by N separate `assist backlog add-phase` calls. Two problems follow from that:

- Review happened against terminal text, not the rendering the item will actually have, and with no way to mark up a specific line.
- Creation was not atomic. The item existed before its phases did, so an abandoned or failed run left a half-written story behind.

## Requirements

1. The **whole** item is reviewed at once — name, type, description, acceptance criteria, and every plan phase with its tasks and manual checks — and all of it is written on a single acceptance.
2. `assist backlog propose --json <file|->` takes the complete item payload, previews it, and on approval inserts the item and all of its phases.
3. `assist backlog add` refuses agent invocations (`isClaudeCode()`), pointing at `propose`. Human CLI use is unchanged.
4. `assist backlog add-phase` stays available for adding a phase to an existing item outside story creation, but an agent-invoked `add-phase` in a web session is itself previewed, so no un-approved phase can be bolted onto a just-approved story.
5. Outside a web session, `propose` prints the rendered item and creates it, preserving the terminal flow where confirmation happens in chat.
6. Rejection exits non-zero, printing the reason and each inline comment with its quoted excerpt, so the agent can revise and re-preview.

### No images

The backlog preview is text plus inline comments only. It has no screenshot attach UI and no drop or paste handling: PR screenshots persist on GitHub, and a backlog item has nowhere to host them.

## Payload shape

`--json` takes a path to a JSON file, or `-` to read the payload from stdin. It is validated with a strict Zod schema (`src/commands/backlog/propose/proposedItemSchema.ts`) — an unknown key is an error, not a silent drop, so a typo in an agent-composed payload fails loudly instead of quietly losing content.

```json
{
	"name": "Preview backlog items before creation",
	"type": "story",
	"description": "**Repro:**\n\n1. …",
	"acceptanceCriteria": ["The pane opens", "Approval creates the item"],
	"phases": [
		{ "name": "Render the plan", "tasks": ["Extend the payload"] },
		{
			"name": "Insert the phases",
			"tasks": ["Write every phase"],
			"manualChecks": ["Run /draft end to end"]
		}
	]
}
```

| Field                | Required | Notes                                                    |
| -------------------- | -------- | -------------------------------------------------------- |
| `name`               | yes      | Non-empty after trimming; becomes the preview pane title |
| `type`               | yes      | `story` or `bug`                                         |
| `description`        | no       | Markdown; real newlines, not escaped `\n` sequences      |
| `acceptanceCriteria` | no       | Defaults to `[]`; each entry non-empty after trimming    |
| `phases`             | no       | Defaults to `[]`; ordered, and written in payload order  |

Each phase is `{ name, tasks, manualChecks }`. `name` and every task are non-empty after trimming, `tasks` needs at least one entry, and `manualChecks` defaults to `[]` — most phases have none.

`phases` and a bug's default `Fix` phase are mutually exclusive: when the payload carries phases they are the plan, and the default is only applied to a `bug` proposed with no phases, matching what `assist backlog add` does.

## Wire protocol

`propose` reuses the existing `pr-preview` / `pr-decision` daemon messages with a `kind` discriminator rather than introducing a new message type. A stale running daemon that predates the discriminator drops the unknown fields and the UI degrades to rendering the item as a PR preview, instead of failing outright.

Client → daemon (`pr-preview`), the fields `propose` adds:

| Field      | Value                                                    |
| ---------- | -------------------------------------------------------- |
| `kind`     | `"backlog-item"` (absent or `"pr"` means a PR preview)   |
| `itemType` | `"story"` or `"bug"`; only meaningful for `backlog-item` |
| `prNumber` | always `null` for `backlog-item`                         |

The daemon stores both on `session.pendingPrPreview` and broadcasts them in `SessionInfo`, which is how the pane knows to render the backlog variant. `pr-decision` is unchanged: `approve` or `reject`, an optional `reason`, and inline `comments` of `{ quote, note }`. A `backlog-item` decision never carries `screenshots`.

Shared plumbing lives in `src/commands/sessions/shared/`, not under `prs/`, because both commands drive it:

- `requestPreviewDecision.ts` — opens the daemon socket, sends `pr-preview`, resolves on the matching `pr-decision`
- `parsePreviewDecision.ts` — matches an inbound line to the pending `requestId`
- `reportPreviewRejection.ts` — prints the reason and each quoted comment, then exits 1
- `awaitPreviewApproval.ts` — the whole gate: request, exit 1 on a transport error, exit 1 on rejection, return the approved decision

## Enforcement rules

| Invocation                                   | Behaviour                                        |
| -------------------------------------------- | ------------------------------------------------ |
| `propose` in a web session                   | Blocks on the pane; writes only on approval      |
| `propose` outside a web session              | Prints the rendered item, then writes it         |
| `add` by a human                             | Unchanged, including the interactive prompts     |
| `add` by an agent (`isClaudeCode()`)         | Errors out, pointing at `propose`                |
| `add-phase` by an agent in a web session     | Previewed; the phase is written only on approval |
| `add-phase` by a human, or outside a session | Unchanged                                        |

An agent is detected with `isClaudeCode()` — the `CLAUDECODE` environment variable Claude Code sets on every command it runs. A web session is detected the same way `prs raise` detects it: `ASSIST_SESSION === "1"` with an `ASSIST_SESSION_ID`.

`add` checks for an agent before anything else — before the git-remote check and before any prompt — and exits non-zero with a message naming `propose`, so nothing is read from the terminal and nothing is written. The whole interactive path, including `--name/--type/--desc/--ac`, is untouched for a human.

`add-phase` gates on **both** conditions: the caller is an agent _and_ it is running in a web session. Either alone writes directly, because a human does not need to approve their own phase and an agent outside a web session has no pane to approve in — that is the same fallback `propose` takes. The gate sits after the item is resolved and the insert position is validated, so a bad id or an out-of-range `--position` still fails without opening a pane. The previewed body is the single phase being added, rendered by the same `renderPhaseSection` that renders each phase inside a `propose` preview, so a phase looks the same whether it arrives with its story or later. The title names the target item (`Add a phase to a774: <item name>`) and the chip carries that item's type.

## Invariants

- Nothing is written to the backlog before an approval. A rejected or abandoned preview leaves no item, no phase and no sub-task behind.
- An approval writes the item and every phase in the payload — never a subset.
- No un-approved phase can be bolted onto a just-approved story. A rejected `add-phase` preview leaves the item's existing plan exactly as it was, and never renumbers a phase.
- There is no agent path to the backlog that skips the gate: `add` refuses agents outright, and `add-phase` previews them.
- A rejection exits non-zero and prints the reason plus every inline comment with its quoted excerpt, so the agent has enough to revise without asking the user to repeat themselves.
- The preview renders exactly the markdown that will be stored, so what the reviewer marked up is what gets written.
- The backlog preview never carries images.
- `propose` prints the created item id on success, so the caller can associate trackers, attach activity, and signal completion against it.
