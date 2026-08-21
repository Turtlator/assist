import { validateProposedContent } from "../../../shared/validateProposedContent";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { fetchIssue } from "./fetchIssue";
import { pushIssueBody } from "./pushIssueBody";
import { reviewProposedIssueEdit } from "./reviewProposedIssueEdit";
import { viewIssue } from "./viewIssue";
import { writeIssueWorkingFile } from "./writeIssueWorkingFile";

type EditIssueOptions = {
	repo?: string;
};

const USAGE = "Usage: assist github issue edit <number> [-R <owner>/<repo>]";

function slugFromUrl(url: string | undefined): string {
	const match = /github\.com\/([^/]+\/[^/]+)\//.exec(url ?? "");
	return match ? match[1] : "unknown/unknown";
}

export async function editIssue(
	numberArg: string,
	options: EditIssueOptions,
): Promise<void> {
	const number = Number.parseInt(numberArg, 10);
	if (!Number.isInteger(number) || number <= 0) {
		console.error(USAGE);
		process.exit(1);
	}

	if (!inWebSession()) {
		viewIssue(number, options.repo);
		return;
	}

	const issue = fetchIssue(number, options.repo);
	const slug = options.repo ?? slugFromUrl(issue.url);
	const target = `${slug}#${number}`;
	validateProposedContent(
		{ subject: "Issue", context: "GitHub issues" },
		issue.title,
		issue.body,
	);

	const bodyPath = writeIssueWorkingFile(
		slug,
		number,
		target,
		issue.updatedAt,
		issue.body,
	);
	await reviewProposedIssueEdit(`Edit ${target}: ${issue.title}`, issue.body);

	if (fetchIssue(number, options.repo).updatedAt !== issue.updatedAt) {
		console.error(
			`${target} was updated on GitHub after it was fetched. Nothing was pushed; the markdown is at ${bodyPath}`,
		);
		process.exit(1);
	}

	pushIssueBody(number, options.repo, bodyPath);
	console.log(`Issue body updated on ${target}`);
}
