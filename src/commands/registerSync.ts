import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { rootConfigHelp } from "./rootConfigHelp";
import { sync } from "./sync";

export function registerSync(program: Command): void {
	const syncCommand = program
		.command("sync")
		.description(
			"Copy command files to ~/.claude/commands; when codex is detected, also install commands as ~/.codex/skills/<name>/SKILL.md, CLAUDE.md as ~/.codex/AGENTS.md, and register the assist codex-hook auto-approval hook in ~/.codex/config.toml; when pi is detected, also install commands as ~/.pi/agent/prompts/<name>.md, CLAUDE.md as ~/.pi/agent/AGENTS.md, and register the assist pi-hook permission-gate extension in ~/.pi/agent/extensions. With --prune, also report commands in those target dirs that sync did not write, and with --prune --force remove them",
		)
		.option("-y, --yes", "Overwrite settings.json without prompting")
		.option(
			"--prune",
			"After syncing, list commands in the target dirs whose name is not in the repo's claude/commands/*.md set; subdirectories and non-.md files are listed separately and never removed",
		)
		.option(
			"--force",
			"With --prune, remove the listed orphaned commands; a codex skill directory is removed only when SKILL.md is its sole content. Errors without --prune",
		)
		.action((options) => {
			if (options.force && !options.prune) {
				console.error("--force requires --prune.");
				process.exit(1);
			}
			return sync(options);
		});

	configHelp(syncCommand, rootConfigHelp.sync);
}
