import { fetchSubtreeIssues } from "./fetchSubtreeIssues";
import type { PlacedIssue, SubtreeIssue } from "./types";

export function walkSubtree(
	root: SubtreeIssue,
	maxDepth: number,
	fetchIssues: (ids: string[]) => SubtreeIssue[] = fetchSubtreeIssues,
): PlacedIssue[] {
	const placed: PlacedIssue[] = [{ ...root, depth: 0, parentId: null }];
	const seen = new Set([root.id]);
	let frontier: PlacedIssue[] = placed;

	for (let depth = 1; depth <= maxDepth && frontier.length > 0; depth += 1) {
		const parentOf = new Map<string, string>();
		for (const parent of frontier) {
			for (const childId of parent.childIds) {
				if (seen.has(childId)) continue;
				seen.add(childId);
				parentOf.set(childId, parent.id);
			}
		}
		if (parentOf.size === 0) break;
		const children = fetchIssues([...parentOf.keys()]).map((issue) => ({
			...issue,
			depth,
			parentId: parentOf.get(issue.id) ?? null,
		}));
		placed.push(...children);
		frontier = children;
	}

	return placed;
}
