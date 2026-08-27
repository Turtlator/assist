import type { Command } from "commander";
import { listRules } from "./rules/listRules";

export function registerRules(program: Command): void {
	const rulesCommand = program
		.command("rules")
		.description("Read the CLAUDE.md rules in scope for a path");

	rulesCommand
		.command("list [path]")
		.description(
			"List the rules from the `## Rules` section of every CLAUDE.md from a path's directory up to the repo root (default: cwd)",
		)
		.action((target?: string) => listRules(target));
}
