import type { Command } from "commander";
import { commits } from "./github/commits";
import { createIssue } from "./github/issue/createIssue";
import { parseSinceDate } from "./github/parseSinceDate";
import { parseTopCount } from "./github/parseTopCount";

export function registerGithub(program: Command): void {
	const githubCommand = program
		.command("github")
		.description("GitHub organisation utilities");

	githubCommand
		.command("commits <org>")
		.description("Report commit activity across an organisation")
		.option(
			"--since <date>",
			"start of the window as YYYY-MM-DD (default: 30 days ago)",
			parseSinceDate,
		)
		.option(
			"--top <n>",
			"only report the top <n> repos by commit count",
			parseTopCount,
		)
		.option("--json", "Output as JSON")
		.action(commits);

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
}
