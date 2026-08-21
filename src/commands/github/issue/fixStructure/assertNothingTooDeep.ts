import type { TooDeepIssue } from "./types";

function describe(entry: TooDeepIssue, leaf: string): string {
	const parent = entry.parent;
	const under = parent ? ` under ${parent.repo}#${parent.number}` : "";
	return `${entry.issue.repo}#${entry.issue.number}${under} sits below ${leaf}, the leaf level`;
}

export function assertNothingTooDeep(
	tooDeep: TooDeepIssue[],
	chain: string[],
): void {
	if (tooDeep.length === 0) return;
	const leaf = chain[chain.length - 1] ?? "the leaf";
	throw new Error(
		[
			...tooDeep.map((entry) => describe(entry, leaf)),
			"Re-parent those issues or aim the run at a deeper target",
		].join("\n"),
	);
}
