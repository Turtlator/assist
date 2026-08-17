import { execFileSync } from "node:child_process";
import { validateProposedContent } from "../../../shared/validateProposedContent";
import { reviewProposedIssueComment } from "./reviewProposedIssueComment";

type CommentIssueOptions = {
	body?: string;
	repo?: string;
};

const USAGE =
	"Usage: assist github issue comment <number> --body <body> [-R <owner>/<repo>]";

export async function commentIssue(
	numberArg: string,
	options: CommentIssueOptions,
): Promise<void> {
	const number = Number.parseInt(numberArg, 10);
	if (!Number.isInteger(number) || number <= 0 || !options.body) {
		console.error(USAGE);
		process.exit(1);
	}

	const { body } = options;
	const target = options.repo
		? `${options.repo}#${number}`
		: `issue #${number}`;
	validateProposedContent(
		{ subject: "Comment", context: "GitHub issues" },
		"",
		body,
	);

	await reviewProposedIssueComment(`Comment on ${target}`, body);

	const args = ["issue", "comment", String(number), "--body", body];
	if (options.repo) args.push("--repo", options.repo);

	try {
		execFileSync("gh", args, { stdio: "inherit" });
	} catch {
		process.exit(1);
	}

	console.log(`Comment posted to ${target}`);
}
