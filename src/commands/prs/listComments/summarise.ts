import type { Thread } from "./groupThreads";

export function summarise(
	reviewCount: number,
	unresolved: Thread[],
	resolved: Thread[],
): string {
	const threadCounts = `${unresolved.length} unresolved and ${resolved.length} resolved threads.`;
	if (reviewCount === 0) return `Found ${threadCounts}`;
	const reviews = `${reviewCount} review comment${reviewCount === 1 ? "" : "s"}`;
	return `Found ${reviews}, ${threadCounts}`;
}
