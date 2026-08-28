import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";
import { normaliseTypeName } from "./fixStructure/normaliseTypeName";
import type { IssueRepoTarget } from "./resolveIssueRepoTarget";

const QUERY = `query($owner: String!, $repo: String!, $after: String) {
	repository(owner: $owner, name: $repo) {
		labels(first: 100, after: $after) {
			nodes { name }
			pageInfo { hasNextPage endCursor }
		}
	}
}`;

type LabelsResponse = {
	data?: {
		repository?: {
			labels?: {
				nodes?: ({ name?: string } | null)[];
				pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
			} | null;
		} | null;
	};
};

function readRepoLabels(target: IssueRepoTarget): string[] {
	const names: string[] = [];
	let after: string | undefined;
	do {
		const page = (
			JSON.parse(
				runGhGraphqlJson(QUERY, { ...target, after }),
			) as LabelsResponse
		).data?.repository?.labels;
		if (!page) {
			throw new Error(
				`No labels could be read for ${target.owner}/${target.repo}`,
			);
		}
		for (const node of page.nodes ?? []) if (node?.name) names.push(node.name);
		after = page.pageInfo?.hasNextPage
			? (page.pageInfo.endCursor ?? undefined)
			: undefined;
	} while (after);
	return names;
}

function matchLabel(names: string[], wanted: string): string | undefined {
	const normalised = normaliseTypeName(wanted);
	return (
		names.find((name) => name === wanted) ??
		names.find((name) => name.toLowerCase() === wanted.toLowerCase()) ??
		names.find((name) => normaliseTypeName(name) === normalised)
	);
}

export function resolveIssueLabels(
	target: IssueRepoTarget,
	wanted: string[],
): string[] {
	const names = readRepoLabels(target);
	return wanted.map((label) => {
		const match = matchLabel(names, label);
		if (!match) {
			throw new Error(
				`${target.owner}/${target.repo} has no ${label} label. It has ${names.join(", ")}`,
			);
		}
		return match;
	});
}
