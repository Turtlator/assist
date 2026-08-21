import { runGhGraphqlJson } from "../../../../shared/runGhGraphqlJson";
import { issueFieldsFragment } from "./issueFieldsFragment";
import { parseIssueNode } from "./parseIssueNode";
import type { FixStructureTarget } from "./resolveFixStructureTarget";
import type { SubtreeIssue } from "./types";

const QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
	repository(owner: $owner, name: $repo) {
		issue(number: $number) { ...issueFields }
	}
}
${issueFieldsFragment}`;

export function fetchRootIssue(target: FixStructureTarget): SubtreeIssue {
	const raw = runGhGraphqlJson(QUERY, {
		owner: target.owner,
		repo: target.repo,
		number: target.number,
	});
	const issue = (
		JSON.parse(raw) as {
			data?: { repository?: { issue?: unknown } | null };
		}
	).data?.repository?.issue;
	if (!issue) {
		throw new Error(
			`No issue ${target.owner}/${target.repo}#${target.number} could be read`,
		);
	}
	return parseIssueNode(issue);
}
