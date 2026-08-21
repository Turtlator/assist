import type { PlacedIssue } from "./types";

export function orderDepthFirst(issues: PlacedIssue[]): PlacedIssue[] {
	const byParent = new Map<string | null, PlacedIssue[]>();
	for (const issue of issues) {
		const siblings = byParent.get(issue.parentId) ?? [];
		siblings.push(issue);
		byParent.set(issue.parentId, siblings);
	}
	const ordered: PlacedIssue[] = [];
	const visit = (issue: PlacedIssue): void => {
		ordered.push(issue);
		for (const child of byParent.get(issue.id) ?? []) visit(child);
	};
	for (const root of byParent.get(null) ?? []) visit(root);
	return ordered;
}
