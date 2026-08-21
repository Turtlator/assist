import type { SubtreeIssue } from "./types";

type RawIssueNode = {
	id: string;
	number: number;
	title: string;
	issueType?: { name?: string } | null;
	repository?: { nameWithOwner?: string } | null;
	labels?: {
		nodes?: ({ id: string; name: string } | null)[];
		pageInfo?: { hasNextPage?: boolean };
	} | null;
	subIssues?: {
		nodes?: ({ id: string } | null)[];
		pageInfo?: { hasNextPage?: boolean };
	} | null;
};

export function parseIssueNode(node: unknown): SubtreeIssue {
	const raw = node as RawIssueNode;
	const repo = raw.repository?.nameWithOwner ?? "";
	const where = `${repo}#${raw.number}`;
	if (raw.labels?.pageInfo?.hasNextPage) {
		throw new Error(
			`${where} carries more than 100 labels, which is not supported`,
		);
	}
	if (raw.subIssues?.pageInfo?.hasNextPage) {
		throw new Error(
			`${where} has more than 100 sub-issues, which is not supported`,
		);
	}
	return {
		id: raw.id,
		number: raw.number,
		title: raw.title,
		repo,
		typeName: raw.issueType?.name ?? null,
		labels: (raw.labels?.nodes ?? []).filter((label) => label !== null),
		childIds: (raw.subIssues?.nodes ?? [])
			.filter((child) => child !== null)
			.map((child) => child.id),
	};
}
