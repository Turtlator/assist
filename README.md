# assist

A CLI tool for enforcing determinism in LLM development workflow automation.

See [devlog](https://staffordwilliams.com/devlog/assist/) for latest features.

## Installation

You can install `assist` globally using npm:

```bash
npm install -g @staff0rd/assist
assist sync
```

## Updating

```bash
assist update
```

## Local Development

```bash
# Clone the repository
git clone git@github.com:staff0rd/assist.git
cd assist

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

After installation, the `assist` command will be available globally. You can also use the shorter `ast` alias.

## Claude Commands

- `/add-command` - Add a new run command to assist.yml
- `/branch <description> [--jira KEY]` - Create a branch off the fresh remote default, deriving a kebab-case slug from the description
- `/bug` - File a bug with reproduction steps, expected and actual behavior
- `/comment` - Add pending review comments to the current PR
- `/commit` - Commit only relevant files from the session
- `/devlog` - Generate devlog entry for the next unversioned day
- `/draft` - Draft a new backlog item with LLM-assisted questioning
- `/forward-comments` - Split a coarse PR comment into per-line review comments, attributed to the original reviewer
- `/handover` - Write a session handover note for the next conversation
- `/pr` - Raise a PR with a concise description, then watch CI in the background
- `/prs-slack <number>` - Post a PR's title and URL to the Slack channel configured in `prs.slack`
- `/refactor` - Run refactoring checks for code quality
- `/prompts` - Analyze denied tool calls and suggest settings changes to auto-allow recurring prompts
- `/recall` - Recall the most recent handover note for this repo
- `/refine` - Refine an existing backlog item through conversation
- `/restructure` - Analyze and restructure tightly-coupled files
- `/review-pr-comments` - Process PR review comments one by one
- `/jira [action] [KEY] [args]` - Jira actions: `view`, `associate`, `update`, `started`, `done`, `help`. `[KEY]` is optional — it resolves from the session's backlog item
- `/github [action] [ref] [args]` - GitHub issue actions: `view`, `associate`, `update`, `started`, `done`, `help`. `[ref]` is optional — it resolves from the session's backlog item
- `/journal` - Append a journal entry summarising recent work
- `/next [id]` - Signal completion and chain into the next backlog item
- `/standup` - Summarise recent journal entries as a standup update
- `/subtask <text>` - Add a sub-task to the session's current backlog item
- `/strip-code-comments` - Strip redundant comments from tracked source files
- `/sync` - Sync commands and settings to ~/.claude
- `/design <prompt>` - Apply the vendored design system prompt to a design task
- `/test-cover` - Incrementally increase test coverage by identifying and testing uncovered files
- `/test-review` - Review existing tests for quality, coverage gaps, and conventions
- `/inspect` - Run .NET code inspections on changed files
- `/screenshot` - Capture a screenshot of a running application window
- `/raven` - Query and manage RavenDB connections and collections
- `/seq` - Query Seq logs from a URL or filter expression
- `/sql` - Query a MSSQL database via assist sql
- `/verify` - Run all verification commands in parallel
- `/verify-new` - Add a new verify:\* run command to assist.yml
- `/transcripts` - Format and summarise meeting transcripts end to end
- `/voice-setup` - Download required voice models (VAD, STT)
- `/voice-start` - Start the voice interaction daemon
- `/voice-stop` - Stop the voice interaction daemon
- `/voice-status` - Check voice daemon status
- `/voice-logs` - Show recent voice daemon logs

## CLI Commands

Every command supports `--help` for full detail on its flags and behaviour.

### Database

- `assist backup [-o, --out <dir>]` - Dump the entire backlog database to `<dir>/backup-<timestamp>.dump` (default `~/.assist/backups`, or `backup.dir`)
- `assist backup schedule --every <duration>` - Install or update a crontab block running `assist backup` on a cadence (e.g. `5m`, `6h`)
- `assist backup schedule status` - Print the active backup cadence and cron expression
- `assist backup schedule remove` - Remove the backup schedule block from the crontab
- `assist db migrate` - Apply pending backlog database migrations in order
- `assist db status` - Report whether the database is in sync with the build's bundled migrations

### Git and GitHub

- `assist sync` - Copy commands, settings, `CLAUDE.md` and design assets to `~/.claude` (plus `~/.codex` and `~/.pi` when those CLIs are on PATH)
- `assist activity [--since <date>]` - Chart GitHub commit activity per day (defaults to last 30 days)
- `assist commit status` - Show git status and diff
- `assist commit <message> [files...]` - Stage files and create a git commit with validation
- `assist branch <slug> [--jira <key>] [--from <ref>]` - Create and switch to a new branch off the fresh remote default (or `--from <ref>`); name is `[<prefix>/][<JIRA>-]<slug>`, long slugs shortened by LLM
- `assist watch wait [--interval <d>] [--timeout <d>|none] [--pull] [--build [entry]]` - Block until the current branch's upstream gains commits, then exit. Fetches once at startup, so commits already on the remote are picked up without waiting out an interval. `--timeout` defaults to `none`, so a quiet branch waits indefinitely rather than exiting 2. With `--pull`, fast-forwards (recovering a dirty tree or a merely-behind branch) and prints the build report (see `assist watch report`) baselined on the pre-pull SHA. With `--build`, runs the `auto-build` run entry — or `[entry]` if named — after a successful pull. Exit codes: `0` moved (and cleanly pulled and built), `2` timed out on an explicit finite `--timeout`, `3` the branch has genuinely diverged, `4` the build failed, `1` cannot wait, `130` interrupted
- `assist watch report [--from <sha>]` - Print the built version from `package.json`, the last 10 commits as a markdown SHA/When/Subject table newest-first, and the restarts the new commits make necessary. With `--from`, commits reachable from `HEAD` but not `<sha>` are marked `← new` and the restart advice comes from the files they changed. Exit codes: `0` printed, `1` git could not resolve the range
- `assist prs` - List pull requests for the current repository
- `assist prs raise --title <t> --what <w> --why <y> [--how <h>] [--resolves <key>] [--force]` - Raise a PR, assembling the body from What/Why/How. In a web session the draft is previewed for approve/reject (with inline comments and pasted screenshots, hosted via the [`gh-image`](https://github.com/drogers0/gh-image) gh extension) before the PR is created
- `assist prs edit [--title <t>] [--what <w>] [--why <y>] [--how <h>] [--resolves <key>]` - Update only the supplied sections of the current PR's body
- `assist prs list-comments` - List all comments on the current branch's pull request
- `assist prs fixed <comment-id> <sha>` - Reply with commit link and resolve thread
- `assist prs wontfix <comment-id> <reason>` - Reply with reason and resolve thread
- `assist prs reply <comment-id> <body>` - Reply to a comment thread without resolving it
- `assist prs comment <path> <line> <body>` - Add a line comment to the pending review
- `assist review [number]` - Run Claude and Codex in parallel to review the current branch's PR, then post line-bound comments. The diff comes from GitHub, so stale local base branches don't pollute the review; cached `claude.md` / `codex.md` / `synthesis.md` are reused when present
  - `[number]` - `gh pr checkout <number>` first, placed by the worktree allocator on a repo with parallel work enabled (see [docs/parallel-work.md](docs/parallel-work.md))
  - `--no-prompt` - Skip all confirmations
  - `--submit` - Default the submit prompt to yes
  - `--force` - Clear all cached files and re-run every phase
  - `--refine` - Skip posting; walk through `synthesis.md` interactively and edit it in place
  - `--apply` - Skip posting; walk through each finding asking apply/skip. Applied findings are fixed in the working tree
  - `--backlog` - Skip posting; file all findings as a single bug backlog item with one phase per finding
  - `--address-comments` - After the review posts comments and submits, start an Address Comments session (`assist review-pr-comments <n>`) for the PR. Only fires inside an assist session, and only when at least one comment was posted and the review was submitted
  - `--verbose` - Per-line log output instead of the stacked-spinner UI (automatic in CI)
- `assist github commits <org> [--since <date>] [--top <n>] [--json]` - Report commit activity across a GitHub organisation: repos ranked by commits, top committers, and a per-repo author breakdown
- `assist news add [url]` - Add an RSS feed URL (rendered in the sessions web News tab)

### Backlog

Backlog data is stored in a global Postgres database (shared across all repos, scoped per repository by git origin), so a connection string is required. Set it via the `ASSIST_DATABASE_URL` environment variable or the `database.url` key in `assist.yml`; the environment variable takes precedence. Without one, every `assist backlog` command exits with a setup message. Commands default to the current repository's items; pass `--all-repos` to span every repository.

Backlog item ids are written and displayed in an `a`-prefixed form (e.g. item 555 is `a555`) to disambiguate them from GitHub PR/issue numbers (`#42`) and Jira keys. Commands and web API routes that take an `<id>` accept either form.

- `assist backlog [--dir <path>]` - Open the backlog tab in the web dashboard (same as `backlog web`)
- `assist backlog list [--status <type>] [-a, --all] [--all-repos] [-v]` - List backlog items with status icons (alias: `ls`; also `assist list` / `assist ls`)
- `assist backlog add` - Add a new backlog item interactively (human CLI use only; agents must use `propose`)
- `assist backlog add --name <n> --type <t> --desc <d> --ac <criterion...>` - Add a backlog item from CLI options
- `assist backlog propose --json <file|-> [--confirmed]` - Create an agent-authored item from a JSON payload, previewed for approval in a web session. Outside a web session an agent invocation prints the draft and writes nothing until it is re-run with `--confirmed`; `--confirmed` is rejected in a web session, where the pane is the gate. Used by `/draft` and `/bug`. See [docs/backlog-item-preview.md](docs/backlog-item-preview.md)
- `assist backlog show <id> [--all-commits]` - Display full detail for a backlog item (alias: `view`). Activity lists the newest 10 commits; `--all-commits` prints every commit
- `assist backlog plan <id>` - Display the phased plan for a backlog item
- `assist backlog update-field <id> [--name <n>] [--desc <d>] [--type <t>] [--ac <criterion...>]` - Update fields on a backlog item
- `assist backlog update-field <id> [--add-ac <text>] [--edit-ac <n> <text>] [--remove-ac <n>]` - Granular 1-based acceptance-criteria edits
- `assist backlog update-field <id> --origin [url-or-key]` - Retag a single item to a different repo
- `assist backlog add-phase <id> <name> --task <t...> [--manual-check <c...>] [--position <pos>]` - Add a phase to an existing item
- `assist backlog update-phase <id> <phase> [--name <n>] [--task <t...>] [--manual-check <c...>]` - Modify a plan phase (alias: `edit-phase`)
- `assist backlog update-phase <id> <phase> [--add-task <t>] [--edit-task <n> <t>] [--remove-task <n>] [--add-check <c>] [--edit-check <n> <c>] [--remove-check <n>]` - Granular 1-based task and manual-check edits
- `assist backlog remove-phase <id> <phase>` - Remove a plan phase from a backlog item
- `assist backlog move-phase <id> <from> <to>` - Reorder a plan phase between 1-based positions
- `assist backlog update-plan <id> --json <file|->` - Replace an item's whole plan from a JSON payload, previewed as a single diff for approval. The path `/refine` and agent sessions use for every plan change
- `assist backlog add-subtask <id> --title <t> [--desc <d>]` - Add a sub-task. Sub-tasks under the `subtasks` key in `assist.yml` / `~/.assist.yml` are auto-applied to every new item
- `assist backlog edit-subtask <id> <idx> [--title <t>] [--desc <d>] [--status <s>]` - Edit a sub-task by its 1-based index
- `assist backlog remove-subtask <id> <idx>` - Remove a sub-task by its 1-based index
- `assist backlog subtask-status <id> <idx> <status>` - Set a sub-task's status (`todo`, `in-progress`, `done`)
- `assist backlog start <id>` - Set a backlog item to in-progress
- `assist backlog stop` - Revert all in-progress items to todo and reset their phase to 1
- `assist backlog done <id>` - Set a backlog item to done (blocked while any sub-task is not done)
- `assist backlog wontdo <id> [reason]` - Set a backlog item to won't do
- `assist backlog set-status <id> <status>` - Set status (`todo`, `in-progress`, `done`, `wontdo`)
- `assist backlog star <id>` / `assist backlog unstar <id>` - Pin an item ahead of unstarred items in the web view
- `assist backlog delete <id>` - Delete a backlog item
- `assist backlog comment <id> <text>` - Add a comment to a backlog item
- `assist backlog comments <id>` - List comments and summaries for a backlog item
- `assist backlog delete-comment <id> <comment-id>` - Delete a comment (summaries cannot be deleted)
- `assist backlog phase-done <id> <phase> <summary>` - Signal that a plan phase is complete
- `assist backlog rewind <id> <phase> --reason <reason>` - Rewind an item to an earlier phase
- `assist backlog next [id] [--once]` - Pick and run the next backlog item, or open `/draft` if none remain
- `assist backlog refine [id] [--once] [--harness <claude|codex|pi>]` - Alias for `refine`
- `assist backlog run <id> [--harness <claude|codex|pi>] [--write|--no-write]` - Run a backlog item's plan phase-by-phase with the selected harness, defaulting to `harness.engine`; for Codex, write access uses the `workspace-write` sandbox and `--no-write` uses `read-only`
- `assist backlog export [file]` - Export every table in the backlog database to a file, or stdout
- `assist backlog import [file]` - Restore every table present in a dump back into the database (`-y, --yes` skips the prompt)
- `assist backlog associate-jira <id> [key]` - Associate a Jira ticket (bare key or browse URL); clears any GitHub issue on the item. `--clear` removes it
- `assist backlog associate-github <id> [issue]` - Associate a GitHub issue (URL or `owner/repo#number`); clears any Jira key on the item. `--clear` removes it
- `assist backlog add-activity <id> <kind> <ref>` - Attach an activity ref (`branch`, `commit`, `commit-parent`, `pr`, `slack`); `--title`, `--url`, `--state` override metadata
- `assist backlog record-slack <url>` - Attach a Slack thread permalink to the current session's item; used by `/prs-slack`
- `assist backlog move-repo <old-origin> [new-origin]` - Retag all items from one origin to another after a repo rename (`-y, --yes` skips the prompt)
- `assist backlog clone <origin>` - Clone a repo over SSH into `clone.baseDir` (default `~/git`)
- `assist backlog web [-p, --port <number>] [--no-open]` - Open the backlog tab in the web dashboard (default port 3100)

### Config and run commands

- `assist run <name> [params...]` - Run a configured command from assist.yml. A backlog item id (`a555` / `555`) with no matching command forwards to `assist backlog run`
- `assist run add` - Add a new run configuration to assist.yml and create a Claude command file
- `assist run link <path> --prefix <prefix>` - Link run configurations from another project's assist.yml
- `assist run remove <name>` - Remove a run configuration and delete its Claude command file
- `assist config get <key>` - Get a config value. Secret values (`database.url`, `roam.*` tokens, `sql.connections[].password`, `seq.connections[].apiToken`) print as `<hidden>`; `--reveal` prints the raw value undecorated for command substitution. An unset key still reports `Key "<key>" is not set`
- `assist config list` - List all config values, with secret values shown as `<hidden>` (no reveal option)
- `assist config set <key> <value>` - Set a config value. `--global` writes to `~/.assist.yml`; `-g --repo [name]` writes a per-repo override there
- `assist config unset <key>` - Remove a config value so the key falls back to the global value or schema default (`-g` targets `~/.assist.yml`; `-g --repo [name]` removes it from a per-repo override there)

The Config tab of the sessions web dashboard never receives secret values: `GET /api/config` replaces each one with a set-or-unset marker, so a configured secret renders as a mask and an unset one as `not set`, both keeping their project/global/default chip. Secret fields edit write-only - the mask clears on focus, typing a value replaces the stored one, and leaving the field untouched keeps it.

### Verify and lint

- `assist verify` - Run all verify:\* commands in parallel (from assist.yml run configs and package.json scripts)
- `assist verify all` - Run all checks, ignoring diff-based filters
- `assist verify --measure` - Print a summary table of each command's status and duration
- `assist verify init [--package-json]` - Add verify scripts to a project
- `assist verify hardcoded-colors` - Check for hardcoded hex colors in src/ (`hardcodedColors.ignore`)
- `assist verify block-code-comments` - Fail on any comment on a changed line (`blockCodeComments.ignore`); machine directives exempt
- `assist verify forbidden-strings` - Check configured JSON files for disallowed values (`forbiddenStrings` rules)
- `assist verify config-keys` - Check every leaf key in `assistConfigSchema` is surfaced in some command's `--help` via `configHelp`
- `assist verify migrations` - Check bundled DB migrations are sequentially numbered, append-only, and free of unacknowledged destructive DDL
- `assist lint [-f, --fix]` - Run lint checks for conventions not enforced by oxlint
- `assist lint init` - Initialize oxlint with baseline linter config

### Refactoring

- `assist refactor check [pattern]` - Check for files that exceed the maximum line count
- `assist refactor ignore <file>` - Add a file to the refactor ignore list
- `assist refactor rename file <source> <destination>` - Rename/move a TypeScript file and update all imports (`--apply` to execute)
- `assist refactor rename symbol <file> <oldName> <newName>` - Rename a symbol across the project (`--apply` to execute)
- `assist refactor extract <file> <functionName> <destination>` - Extract a function and its private dependencies to a new file (`--apply` to execute)
- `assist refactor restructure [pattern]` - Analyze the import graph and restructure tightly-coupled files into nested directories

### Devlog

- `assist devlog list` - Group git commits by date
- `assist devlog next` - Show commits for the day after the last versioned entry
- `assist devlog repos` - Show which github.com/staff0rd repos are missing devlog entries
- `assist devlog skip <date>` - Add a date to the skip list
- `assist devlog version` - Show current repo name and version info

### Hooks

- `assist cli-hook` - PreToolUse hook auto-approving CLI commands from `allowed.cli-reads` / `allowed.cli-writes` (plus read-only `gh api`), checking each sub-command of a compound command independently
- `assist cli-hook add <cli>` - Discover a CLI's commands and auto-permit read-only ones
- `assist cli-hook check <command> [--tool <tool>]` - Check whether a command would be auto-approved
- `assist cli-hook deny` - List all deny rules
- `assist cli-hook deny add <pattern> <message>` - Add a deny rule for a command pattern
- `assist cli-hook deny remove <pattern>` - Remove a deny rule by pattern
- `assist codex-hook` - Codex `PreToolUse`/`PermissionRequest` hook reusing the `cli-hook` allowlist; installed by `assist sync` when `codex` is on PATH
- `assist pi-hook` - pi permission-gate adapter reusing the `cli-hook` allowlist, emitting `allow` / `deny` / `gate`; installed by `assist sync` when `pi` is on PATH
- `assist edit-hook` - PreToolUse hook that blocks `Edit`/`Write`/`MultiEdit` calls from adding, changing, or removing a `// assist-maintainability-override` marker, or from introducing a code comment (use `code-comment set`/`confirm` for the rare comment that belongs)
- `assist code-comment set <file> <line> <text>` - Validate a comment (max 50 chars, single-line) and issue a pin authorising its insertion
- `assist code-comment confirm <pin>` - Insert the pinned comment at its file/line and clear the pin state
- `assist db-migration unlock` - Page a human to approve creating the next new migration module, issuing a pin via desktop notification
- `assist db-migration confirm <pin>` - Confirm a pin from `db-migration unlock`, letting that migration's file write through once
- `assist notify` - Show desktop notification from JSON stdin (macOS, Windows, WSL)
- `assist status-line` - Format Claude Code status line from JSON stdin

### .NET

- `assist dotnet inspect [sln]` - Run JetBrains inspections on changed .cs files to find dead code
  - `--scope all|base:<ref>|commit:<ref>` - Inspect the whole solution, everything changed since a base ref, or one commit
  - `--only <ids...>` / `--suppress <ids...>` - Show only, or suppress, specific issue type IDs
  - `--roslyn` - Use Roslyn analyzers via msbuild instead of JetBrains
  - `--swea` - Enable solution-wide error analysis (slower but more thorough)
- `assist dotnet check-locks` - Check if build output files are locked by a debugger
- `assist dotnet deps <csproj>` - Show .csproj project dependency tree and solution membership
- `assist dotnet in-sln <csproj>` - Check whether a .csproj is referenced by any .sln file

### Data sources

- `assist jira auth` - Authenticate with Jira via API token
- `assist jira ac <issue-key>` - Print acceptance criteria for a Jira issue
- `assist jira view <issue-key>` - Print the title and description of a Jira issue
  - Note: Claude fetches Jira context via the MCP Atlassian server, so `/jira` and Jira-key mentions go through MCP. These CLI commands remain for direct human use.
- `assist ravendb auth add` - Add a new RavenDB connection
- `assist ravendb auth list` - List configured RavenDB connections
- `assist ravendb auth remove <name>` - Remove a configured connection
- `assist ravendb set-connection <name>` - Set the default connection
- `assist ravendb query [connection] [collection]` - Query a RavenDB collection (`--page-size`, `--sort`, `--query`, `--limit`)
- `assist ravendb collections [connection]` - List collections and document counts
- `assist seq auth add` - Add a new Seq connection
- `assist seq auth list` - List configured Seq connections
- `assist seq auth remove <name>` - Remove a configured connection
- `assist seq set-connection <name>` - Set the default Seq connection
- `assist seq query <filter>` - Query Seq events (`-c <connection>`, `--json`, `-n <count>`, `--from <date>`, `--to <date>`)
- `assist sql auth add` - Add a new MSSQL connection
- `assist sql auth list` - List configured SQL connections
- `assist sql auth remove <name>` - Remove a configured connection
- `assist sql set-connection <name>` - Set the default SQL connection
- `assist sql query "<sql>" [connection]` - Execute a read-only SQL statement and print a table (rejects mutating statements)
- `assist sql mutate "<sql>" [connection]` - Execute a mutating SQL statement and print rows affected
- `assist sql tables [connection]` - List tables in the connected database
- `assist sql columns <table> [connection]` - List columns for a table (`schema.table` for a non-default schema)

### Other

- `assist netcap [-p, --port <port>] [-o, --out <dir>] [-f, --filter <pattern>]` - Capture browser network traffic to `capture.jsonl` under `--out` (default `~/.assist/netcap`), paired with the [netcap browser extension](#netcap-browser-extension)
- `assist netcap extract-linkedin-posts [file]` - Parse a netcap capture into structured LinkedIn posts, written to `posts.json` beside the capture
- `assist screenshot <process>` - Capture a screenshot of a running application window (`screenshot.outputDir`, default `./screenshots`)
- `assist handover save --summary <s>` - Save a session handover note (content from stdin), scoped by the repo's git origin
- `assist handover list` - List unrecalled handovers for this repo, most recent first
- `assist handover recall [id]` - Print an unrecalled handover and mark it recalled (most recent by default)
- `assist handover load` - SessionStart hook entry point advising how many unrecalled handovers exist
- `assist mermaid export [file.md]` - Render each fenced mermaid block to `<stem>-<index>.svg` via [Kroki](https://kroki.io) (`--out`, `--index`, `mermaid.krokiUrl`)
- `assist prompts` - Show top 10 denied tool calls by frequency with count and repo breakdown

### Project setup

- `assist init` - Initialize project with VS Code and verify configurations
- `assist new vite` - Initialize a new Vite React TypeScript project
- `assist new cli` - Initialize a new tsup CLI project
- `assist update` - Update assist to the latest version and sync commands
- `assist vscode init` - Add VS Code configuration files
- `assist deploy init` - Initialize Netlify project and configure deployment
- `assist deploy redirect` - Add trailing slash redirect script to index.html
- `assist roam auth` - Authenticate with Roam via OAuth
- `assist roam show-claude-code-icon` - Forward Claude Code hook activity to Roam local API

### Complexity

- `assist coverage` - Print global statement coverage percentage
- `assist complexity <pattern>` - Analyze a file (all metrics if single match, maintainability if multiple)
- `assist complexity cyclomatic [pattern]` - Calculate cyclomatic complexity per function
- `assist complexity halstead [pattern]` - Calculate Halstead metrics per function
- `assist complexity maintainability [pattern]` - Calculate maintainability index per file (`--ignore <glob>`, plus `complexity.ignore`). A file can declare its own threshold with a `// assist-maintainability-override: N` comment in its first ~10 lines, replacing `--threshold` for that file only
- `assist complexity sloc [pattern]` - Count source lines of code per file

### Transcripts and voice

- `assist transcript configure` - Configure transcript directories
- `assist transcript list` - List raw .vtt filenames waiting in the pick-up directory
- `assist transcript move <file>` - Convert a raw .vtt to a dated markdown transcript and archive the original
- `assist voice setup` - Download required voice models (VAD, STT)
- `assist voice start [--foreground]` - Start the voice daemon (always-on, listens for wake word)
- `assist voice stop` - Stop the voice daemon
- `assist voice status` - Check voice daemon status and recent events
- `assist voice devices` - List available audio input devices
- `assist voice logs [-n <count>]` - Show recent voice daemon log entries

### Sessions

- `assist sessions` - Start the web dashboard (same as `sessions web`)
- `assist sessions web [-p, --port <number>] [--no-open]` - Start the web dashboard with Sessions, Backlog and News tabs (default port 3100). Ctrl+R in the foreground terminal opens a restart menu; Ctrl+. in the browser jumps to the next session waiting on input
- `assist sessions summarise [-f, --force] [-n, --limit <count>]` - Generate one-line summaries for unsummarised Claude sessions
- `assist sessions set-status <status>` - Report the current session's status (`running`/`waiting`) to the daemon; invoked by the Claude Code hooks the daemon wires into each session
- `assist daemon run` - Run the sessions daemon in the foreground (normally auto-spawned detached)
- `assist daemon status` - Show daemon status, live sessions, and any stray processes or stolen socket
- `assist daemon stop` - Stop the sessions daemon; running claude sessions resume on next start
- `assist daemon restart` - Restart the sessions daemon, resuming previously running claude sessions
- `assist daemon drain [--yes]` - Remove all sessions from the local daemon for a clean slate; a session holding unpushed work is stopped, not removed

### Session launchers

- `assist next [id] [--once]` - Alias for `backlog next [id]`; `--once` exits after the first completed item run
- `assist draft [description] [--once]` (alias: `feat`) - Launch Claude in `/draft` mode, chain into next on `/next` signal
- `assist bug [description] [--once]` - Launch Claude in `/bug` mode, chain into next on `/next` signal
- `assist refine [id] [--once] [--harness <claude|codex|pi>]` - Launch a coding harness in `/refine` mode; `--harness` picks the engine, defaulting to the configured `harness.engine` (Claude)
- `assist review-pr-comments [number]` - Launch Claude in `/review-pr-comments` mode; a PR number is checked out first via `gh pr checkout`
- `assist signal next [id]` - Write a next signal to chain into `assist next`
- `assist signal done [id]` - Write a done signal marking the session's initial task complete; an optional `id` surfaces the backlog item the session created onto its card

Each launcher accepts `--resume-session <id>` to resume an interrupted Claude session (used by the daemon when it restarts a running item).

## Sessions dashboard

Web sessions are owned by a long-lived daemon process, not the web server: the server is a thin client relaying WebSocket traffic to the daemon over a local IPC socket (`~/.assist/daemon/daemon.sock`; named pipe `\\.\pipe\assist-sessions-daemon` on Windows). Restarting the web server leaves sessions running with scrollback intact. The daemon logs to `~/.assist/daemon/daemon.log` and auto-exits once no sessions remain and no client has connected for 60 seconds. See [docs/session-lifecycle.md](docs/session-lifecycle.md).

The topnav has a **Design** dropdown: submitting a prompt launches an interactive `claude` session with the vendored design system prompt appended via `--append-system-prompt`.

Every live session card carries an **add-agent** button (👥) that starts a second agent inside that session's existing workspace rather than allocating a new one. While several agents share a workspace, only the last one to leave triggers teardown.

A `run:` entry in `assist.yml` flagged `server: true` (with an optional display-only `port:`) is a singleton **dev server**: at most one may be live per normalised git remote, i.e. across a clone and all its sibling clones. Session cards for such a repo show a **▶ start** button; the daemon rejects a second server run for that remote, and the web UI turns the conflict into a "replace running server?" prompt. The serving card shows a `serving :<port>` chip and a **⏹ stop** button, and the slot frees whenever that session stops. Non-`server` runs are unconstrained.

### Windows-host repos (from WSL)

Requires `assist` installed on the Windows host.

- `sessions.windowsProjectsRoot` — the Windows `.claude/projects` directory as seen from WSL (e.g. `/mnt/c/Users/<user>/.claude/projects`); enables discovery of Windows-host repos, tagged with a `Windows` badge.
- `sessions.windowsDaemonHost` / `sessions.windowsDaemonPort` — where the WSL daemon reaches the native Windows daemon (defaults `127.0.0.1` / `51764`; set the host to the Windows IP on WSL2 NAT-mode networking).
- `sessions.windowsVersionCheck` — reaction to a protocol-version mismatch in the WSL↔Windows handshake: `block` (default) refuses creates and auto-heals the host, `warn` proceeds anyway, `off` skips the check.

### Session config keys

- `sessions.includeCommittedChanges` — defaults to **true**: the card's change counts, the `/diff` view and its scope picker cover the commits recorded against the session's backlog item as well as uncommitted work, so the change link survives the agent committing. Each committed path is diffed against the parent of the earliest of those commits that touched it, so nothing outside the item's own commits is shown. Set it false to count and diff only uncommitted changes. A session whose item has no recorded commits and a clean tree still shows nothing either way.
- `sessions.topBar` — defaults to **true**: a sticky top bar inside the terminal panel carrying the session's ids, backlog chip and story name, the phase caption, elapsed time, the Continue/Auto-run/Dismiss switches and the session actions. Set it false to keep all of that on the card instead.
- `sessions.floatWaiting` — defaults to **true**: sessions that have been `waiting` on input for longer than the threshold float above the other cards, longest waiting first. Set it false to keep the star-only ordering; starred sessions still sort above everything.
- `sessions.floatWaitingAfterMs` — defaults to **5000**: how long a session must have been `waiting` on input before `sessions.floatWaiting` floats it.
- `sessions.maxLive` — defaults to **24**: the ceiling on concurrent live sessions one daemon holds. Spawning past it is refused (`session ceiling of N reached`) and a daemon birth respawns at most this many persisted sessions, deferring the rest to stopped cards. The daemon serves every repo, so set it globally: `assist config set sessions.maxLive 32 -g`.

## Parallel work

Concurrent sessions in one repo can be isolated with native git worktrees instead of keeping multiple physical clones: see [docs/parallel-work.md](docs/parallel-work.md). All three flags **default off**:

- `worktree.enabled` (parallel work) — spill concurrent sessions into adjacent `<clone>-N` worktrees. Off means every session on the repo shares its single working copy.
- `worktree.trunk` (trunk-based) — on, a spilled worktree's branch tracks `origin/<trunk>` so commits land on the mainline. Off, it starts off the remote default branch with no mainline tracking, leaving the session to raise its own branch and PR.

  While it is on, a job that commits never runs in the clone: `backlog run <id>` (spawned fresh or chained into from a session already sitting in the clone) and PR checkouts (`review <n>`, `review-pr-comments <n>`) always allocate a `<clone>-N`, even when the clone is idle and clean. Committing there would land the work on the local mainline and leave every later worktree starting from that HEAD. Plain prompts, `spawnInTree` sessions, `draft`/`bug`/`refine` and every other command keep the normal clone-preferring placement, and a session pinned in place stays where it was launched. There is no fallback — if the worktree can't be created the spawn fails with the reason in `daemon.log` rather than dropping the job in the clone. Non-trunk repos are unaffected.

- `worktree.includeDrafts` — give draft, bug and refine sessions their own `<clone>-N`. They change no code, so by default they run in the clone's working copy at no worktree, dep-install or teardown cost.

Neither flag leaves permanent state on the clone: nothing writes to the clone's `.git/config` (`assist commit` derives its push refspec from the current branch), so turning parallel work back off leaves the repo as it was.

## Iterating on assist itself

Web server changes only need the `assist sessions` process restarted — sessions survive. Daemon/session-core changes need `assist daemon restart`: claude sessions are auto-respawned via `claude --resume` with scrollback starting fresh, while run sessions reappear as not-restored tiles that can be retried.

## Other config keys

- `prs.slack` — the Slack channel (e.g. `#example`) that `/prs-slack` posts pull requests to via the Slack MCP connector
- `prs.required` — when `true` (default `false`), `assist backlog run` cuts and records a fresh branch for a story that has no recorded branch at run start, so a new story never inherits the previous one's branch
- `prs.promptJira` — when `true` (default `false`), the `assist prs raise --help` `--resolves` guidance instructs asking the user for a Jira key
- `commit.pull` — when enabled, `assist draft`, `bug`, `refine`, `next` and `backlog run` run `git pull --ff-only` first and abort if it fails (`next` pulls once per invocation, not per item)
- `commit.expectedBranch` — when set (e.g. `main`), `assist commit` prints a non-blocking warning if HEAD is on any other branch, so work on a stray branch isn't silently orphaned
- `branch.prefix` — when set (e.g. `sw`), `assist branch <slug>` prepends `<prefix>/` to the branch name
- `branch.defaultBranch` — override the base branch, which is otherwise resolved live from the remote (`git ls-remote --symref origin HEAD`), falling back to `main`

## netcap browser extension

`assist netcap` only runs the receiver; the browser side is a raw Manifest V3 extension (no build step) under `netcap-extension/`. A MAIN-world content script patches `fetch`/`XMLHttpRequest` to capture `{url, method, status, requestBody, responseBody, timestamp}` and relays each entry to the background service worker, which POSTs it to the receiver. Forwarding happens in the background context, so the page's CSP (`connect-src`) never blocks it.

1. Run `assist netcap` — it prints the receiver URL, the capture file path, and the extension directory to load. The receiver host/port and the optional `--filter` substring are baked into the extension's `background.js` at this point. Under WSL it copies the extension to `C:\tools\netcap-extension` and targets the WSL VM's IP, printing that Windows path instead; re-run after a reboot (the WSL IP can change) and reload the extension.
2. Load the unpacked extension:
   - **Firefox**: open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json` inside the printed extension directory. (Requires Firefox 128+ for MAIN-world content scripts.)
   - **Chrome**: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extension directory.
3. On load the background worker pings the receiver; `ping from extension` appears in the `assist netcap` log, confirming browser→server connectivity.
4. Browse a site; matching requests append to the capture file live and survive page refreshes. Press Ctrl-C to stop the receiver; it prints how many entries were captured.
