import type { Command } from "commander";
import { fixConflict } from "./fixConflict";

export function registerFixConflict(
	program: Command,
	resumeFlag: string,
): void {
	program
		.command("fix-conflict")
		.argument("[number]", "PR number to check out first")
		.option("--rebase", "Rebase onto the remote default instead of merging")
		.option("--resume-session <id>", resumeFlag)
		.description("Launch Claude in /fix-conflict mode (single session)")
		.action(
			(
				number: string | undefined,
				options: { rebase?: boolean; resumeSession?: string },
			) =>
				fixConflict(number, {
					rebase: options.rebase,
					resumeSessionId: options.resumeSession,
				}),
		);
}
