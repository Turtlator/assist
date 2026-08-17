import type { Command } from "commander";
import { commits } from "./github/commits";
import { parseSinceDate } from "./github/parseSinceDate";
import { parseTopCount } from "./github/parseTopCount";
import { registerGithubIssue } from "./registerGithubIssue";

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

	registerGithubIssue(githubCommand);
}
