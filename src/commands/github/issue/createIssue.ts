import { validateProposedContent } from "../../../shared/validateProposedContent";
import { applyCreatedIssueMetadata } from "./applyCreatedIssueMetadata";
import { buildIssuePreviewBody } from "./buildIssuePreviewBody";
import {
	type CreateIssueMetadata,
	resolveCreateIssueMetadata,
} from "./resolveCreateIssueMetadata";
import { reviewProposedIssue } from "./reviewProposedIssue";
import { runGhIssueCreate } from "./runGhIssueCreate";

type CreateIssueOptions = {
	title?: string;
	body?: string;
	repo?: string;
	type?: string;
	project?: string;
	status?: string;
};

const USAGE =
	"Usage: assist github issue create --title <title> --body <body> [-R <owner>/<repo>] [--type <name>] [--project <number>] [--status <name>]";

function preflight(
	options: CreateIssueOptions,
): CreateIssueMetadata | undefined {
	try {
		return resolveCreateIssueMetadata(options);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

function previewMetadata(resolved: CreateIssueMetadata | undefined) {
	if (!resolved) return undefined;
	return {
		repo: `${resolved.target.owner}/${resolved.target.repo}`,
		type: resolved.issueType?.name,
		project:
			resolved.project &&
			`${resolved.project.number} (${resolved.project.title})`,
		status: resolved.project?.status?.optionName,
	};
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

	await reviewProposedIssue(
		title,
		buildIssuePreviewBody(previewMetadata(resolved), body),
	);

	const output = runGhIssueCreate(title, body, options.repo);
	console.log(output.trim());

	if (resolved) applyCreatedIssueMetadata(output, resolved);
}
