import type { UnanchoredFinding } from "./partitionFindings";

export function carriedUnanchoredFindings(
	unanchored: UnanchoredFinding[],
): UnanchoredFinding[] {
	return unanchored.filter((finding) => finding.source !== "already-raised");
}
