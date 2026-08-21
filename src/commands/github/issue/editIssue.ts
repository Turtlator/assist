import { validateProposedContent } from "../../../shared/validateProposedContent";
import { inWebSession } from "../../sessions/shared/inWebSession";
import { fetchIssue } from "./fetchIssue";
import { pushUnchangedIssue } from "./pushUnchangedIssue";
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

	const save = (markdown: string) =>
		writeIssueWorkingFile(slug, number, target, issue.updatedAt, markdown);

	const bodyPath = save(issue.body);
	const edited = await reviewProposedIssueEdit(
		`Edit ${target}: ${issue.title}`,
		issue.body,
		save,
	);
	validateProposedContent(
		{ subject: "Issue", context: "GitHub issues" },
		issue.title,
		edited,
	);

	pushUnchangedIssue(number, options.repo, target, issue.updatedAt, bodyPath);
}
