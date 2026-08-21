import type { Command } from "commander";
import { commentIssue } from "./github/issue/commentIssue";
import { createIssue } from "./github/issue/createIssue";
import { editIssue } from "./github/issue/editIssue";
import { readBodyArgument } from "./prs/readBodyArgument";

export function registerGithubIssue(githubCommand: Command): void {
	const issueCommand = githubCommand
		.command("issue")
		.description("GitHub issue utilities");

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

	issueCommand
		.command("edit <number>")
		.description("Edit an existing GitHub issue's body in the preview pane")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.addHelpText(
			"after",
			"\nFetches the issue's current body and opens it in the assist web preview pane, where it can be reworked before it is pushed back. Approving pushes the pane's markdown to the issue; nothing is pushed if the issue moved on GitHub after it was fetched, or outside a web session.\nOnly the body is touched — the title, labels, assignees and state are left alone.",
		)
		.action(editIssue);

	issueCommand
		.command("comment <number>")
		.description("Comment on a GitHub issue (body of - reads it from stdin)")
		.option("--body <body>", "Comment body (- reads it from stdin)")
		.option(
			"-R, --repo <owner/repo>",
			"Target repository (defaults to the current repo)",
		)
		.addHelpText(
			"after",
			"\nThe comment is outward-facing: write it for the repo's readers, not the team. It is rejected if it references Claude or an assist backlog item.\nIn an assist web session the body is previewed for approve/reject first (with inline comments); nothing is posted until it is approved.",
		)
		.action(
			async (number: string, options: { body?: string; repo?: string }) => {
				await commentIssue(number, {
					...options,
					body: options.body ? await readBodyArgument(options.body) : undefined,
				});
			},
		);
}
