import { validateProposedContent } from "../../../shared/validateProposedContent";
import { applyCreatedIssueType } from "./applyCreatedIssueType";
import { buildIssuePreviewBody } from "./buildIssuePreviewBody";
import {
	type CreateIssueType,
	resolveCreateIssueType,
} from "./resolveCreateIssueType";
import { reviewProposedIssue } from "./reviewProposedIssue";
import { runGhIssueCreate } from "./runGhIssueCreate";

type CreateIssueOptions = {
	title?: string;
	body?: string;
	repo?: string;
	type?: string;
};

const USAGE =
	"Usage: assist github issue create --title <title> --body <body> [-R <owner>/<repo>] [--type <name>]";

function preflight(options: CreateIssueOptions): CreateIssueType | undefined {
	if (!options.type) return undefined;
	try {
		return resolveCreateIssueType(options.type, options.repo);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

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

	const resolved = preflight(options);
	const metadata = resolved && {
		repo: `${resolved.target.owner}/${resolved.target.repo}`,
		type: resolved.issueType.name,
	};

	await reviewProposedIssue(title, buildIssuePreviewBody(metadata, body));

	const output = runGhIssueCreate(title, body, options.repo);
	console.log(output.trim());

	if (resolved) applyCreatedIssueType(output, resolved.issueType);
}
