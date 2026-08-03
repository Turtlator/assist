import type { Command } from "commander";
import { codexHook } from "./codexHook";

export function registerCodexHook(program: Command): void {
	program
		.command("codex-hook")
		.description(
			"Codex hook: auto-approves read-only CLI commands (PreToolUse/PermissionRequest) and reports session status (running/waiting) to the sessions daemon",
		)
		.action(() => codexHook());
}
