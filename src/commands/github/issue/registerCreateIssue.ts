import type { Command } from "commander";
import { createIssue } from "./createIssue";

export function registerCreateIssue(issueCommand: Command): void {
	issueCommand
		.command("create")
		.description("Create a GitHub issue")
		.option("--title <title>", "Issue title")
		.option("--body <body>", "Issue body")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.addHelpText(
			"after",
			"\nThere is no What/Why/How template: an issue reports a problem, and the target repo's own issue template is unknowable from here. Write the body as the repo's maintainers would expect.\nIn an assist web session the title and body are previewed for approve/reject first (with inline comments); nothing is created until it is approved.",
		)
		.action(createIssue);
}
