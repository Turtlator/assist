import type { Command } from "commander";
import { addRule } from "./rules/addRule";
import { indexRules } from "./rules/indexRules";
import { listRules } from "./rules/listRules";

export function registerRules(program: Command): void {
	const rulesCommand = program
		.command("rules")
		.description("Read and write the CLAUDE.md rules in scope for a path");

	rulesCommand
		.command("list [path]")
		.description(
			"List the rules from the `## Rules` section of every CLAUDE.md from a path's directory up to the repo root (default: cwd)",
		)
		.action((target?: string) => listRules(target));

	rulesCommand
		.command("add <text>")
		.description(
			"Add a rule to the `## Rules` section of the scope's CLAUDE.md, allocating the next repo-wide code and creating the section when absent",
		)
		.option(
			"--scope <path>",
			"File or directory whose nearest CLAUDE.md receives the rule, or a CLAUDE.md path to write to directly (default: cwd)",
		)
		.action((text: string, options: { scope?: string }) =>
			addRule(text, options),
		);

	rulesCommand
		.command("index")
		.description(
			"Record the directories that carry their own `## Rules` in the repo root's CLAUDE.md, so scoped rules are discoverable from the root. Always repo-wide, resolved from the cwd",
		)
		.action(() => indexRules());
}
