import type { IssueLabel } from "./types";

export function matchedLabels(
	labels: IssueLabel[],
	stripLabels: string[],
): IssueLabel[] {
	if (stripLabels.length === 0) return [];
	const wanted = new Set(stripLabels.map((name) => name.trim().toLowerCase()));
	return labels.filter((label) => wanted.has(label.name.trim().toLowerCase()));
}
