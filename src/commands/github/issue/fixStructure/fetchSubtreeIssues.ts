import { runGhGraphqlJson } from "../../../../shared/runGhGraphqlJson";
import { issueFieldsFragment } from "./issueFieldsFragment";
import { parseIssueNode } from "./parseIssueNode";
import type { SubtreeIssue } from "./types";

const QUERY = `query($ids: [ID!]!) {
	nodes(ids: $ids) { ... on Issue { ...issueFields } }
}
${issueFieldsFragment}`;

const BATCH = 50;

export function fetchSubtreeIssues(ids: string[]): SubtreeIssue[] {
	const issues: SubtreeIssue[] = [];
	for (let start = 0; start < ids.length; start += BATCH) {
		const raw = runGhGraphqlJson(QUERY, {
			ids: ids.slice(start, start + BATCH),
		});
		const nodes =
			(JSON.parse(raw) as { data?: { nodes?: unknown[] } }).data?.nodes ?? [];
		for (const node of nodes) {
			if (node) issues.push(parseIssueNode(node));
		}
	}
	return issues;
}
