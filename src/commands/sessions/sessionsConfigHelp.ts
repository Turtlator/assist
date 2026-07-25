import type { ConfigHelpEntry } from "../../shared/configHelp";

export const sessionsConfigHelp: ConfigHelpEntry[] = [
	{
		key: "sessions.windowsProjectsRoot",
		setter:
			"assist config set sessions.windowsProjectsRoot /mnt/c/Users/you/.claude/projects",
		note: "WSL path to the Windows .claude/projects root to discover",
	},
	{
		key: "sessions.windowsDaemonHost",
		setter: "assist config set sessions.windowsDaemonHost 127.0.0.1",
		note: "host the WSL daemon dials to reach the Windows daemon (default: 127.0.0.1)",
	},
	{
		key: "sessions.windowsDaemonPort",
		setter: "assist config set sessions.windowsDaemonPort 51764",
		note: "TCP port the Windows daemon listens on (default: 51764)",
	},
	{
		key: "sessions.windowsVersionCheck",
		setter: "assist config set sessions.windowsVersionCheck block",
		note: "Windows daemon version mismatch handling: block | warn | off",
	},
	{
		key: "sessions.includeCommittedChanges",
		setter: "assist config set sessions.includeCommittedChanges true -g",
		note: "session card counts and /diff span the whole session (its first commit's parent, else merge-base with the default branch) instead of just uncommitted work (default off)",
	},
	{
		key: "worktree.enabled",
		setter: "assist config set worktree.enabled true -g --repo",
		note: "opt in per repo: spill concurrent sessions into adjacent <clone>-N worktrees (default off)",
	},
	{
		key: "worktree.trunk",
		setter: "assist config set worktree.trunk true -g --repo",
		note: "trunk-based: a spilled worktree lands on the mainline (default off: it starts off the remote default with no mainline tracking, so the session raises its own branch and PR)",
	},
	{
		key: "worktree.includeDrafts",
		setter: "assist config set worktree.includeDrafts true -g --repo",
		note: "draft/bug/refine sessions get their own <clone>-N too (default off: they run in the clone, since they change no code)",
	},
	{
		key: "worktree.root",
		setter: "assist config set worktree.root ~/git -g --repo",
		note: "optional; parent dir for <clone>-N worktrees (default: the clone's parent)",
	},
	{
		key: "worktree.install",
		setter: "assist config set worktree.install true -g --repo",
		note: "per-worktree dep install: true auto-detects the package manager, or give an explicit command; false to skip",
	},
	{
		key: "worktree.commitBeforeManualChecks",
		setter:
			"assist config set worktree.commitBeforeManualChecks true -g --repo",
		note: "phase prompts run /commit before asking the user to perform manual checks, so work is not left uncommitted in a reapable worktree (default off)",
	},
	{
		key: "worktree.copy",
		setter:
			"assist config set worktree.copy .env,.claude/settings.local.json -g --repo",
		note: "gitignored files copied into a new worktree so it can build/run",
	},
];
