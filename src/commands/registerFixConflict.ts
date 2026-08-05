import type { Command } from "commander";
import { fixConflict } from "./fixConflict";

export function registerFixConflict(program: Command): void {
	program
		.command("fix-conflict")
		.argument("[number]", "PR number to check out first")
		.description("Launch Claude in /fix-conflict mode (single session)")
		.action((number: string | undefined) => fixConflict(number));
}
