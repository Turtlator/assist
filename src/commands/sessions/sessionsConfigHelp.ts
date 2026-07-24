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
		key: "worktree.enabled",
		setter: "assist config set worktree.enabled true --repo",
		note: "opt in per repo: spill concurrent sessions into adjacent <clone>-N worktrees (default off)",
	},
	{
		key: "worktree.root",
		setter: "assist config set worktree.root ~/git --repo",
		note: "optional; parent dir for <clone>-N worktrees (default: the clone's parent)",
	},
	{
		key: "worktree.install",
		setter: "assist config set worktree.install true --repo",
		note: "per-worktree dep install: true auto-detects the package manager, or give an explicit command; false to skip",
	},
	{
		key: "worktree.copy",
		setter:
			"assist config set worktree.copy .env,.claude/settings.local.json --repo",
		note: "gitignored files copied into a new worktree so it can build/run",
	},
];
