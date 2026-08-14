import { execFileSync } from "node:child_process";
import { validateProposedContent } from "../../../shared/validateProposedContent";
import { reviewProposedIssue } from "./reviewProposedIssue";

type CreateIssueOptions = {
	title?: string;
	body?: string;
	repo?: string;
};

const USAGE =
	"Usage: assist github issue create --title <title> --body <body> [-R <owner>/<repo>]";

export async function createIssue(options: CreateIssueOptions): Promise<void> {
	if (!options.title || !options.body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { title, body } = options;
	validateProposedContent(
		{ subject: "Issue", context: "GitHub issues" },
		title,
		body,
	);

	await reviewProposedIssue(title, body);

	const args = ["issue", "create", "--title", title, "--body", body];
	if (options.repo) args.push("--repo", options.repo);

	try {
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}
}
