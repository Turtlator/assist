type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

const UNTRUNCATABLE_READS = ["assist backlog show", "assist backlog view"];

const TRUNCATOR_BINARIES = ["head", "tail"];

const PIPED_TRUNCATOR_RE = /\|\s*(?:\S*\/)?(?:head|tail)\b/;

function matchUntruncatableRead(part: string): string | undefined {
	return UNTRUNCATABLE_READS.find(
		(prefix) => part === prefix || part.startsWith(`${prefix} `),
	);
}

function isTruncator(part: string): boolean {
	const binary = part.split(/\s+/)[0]?.split("/").pop() ?? "";
	return TRUNCATOR_BINARIES.includes(binary) || PIPED_TRUNCATOR_RE.test(part);
}

export function findTruncatedReadDeny(
	parts: string[],
): HookDecision | undefined {
	const read = parts.map(matchUntruncatableRead).find(Boolean);
	if (!read || !parts.some(isTruncator)) return undefined;

	return {
		permissionDecision: "deny",
		permissionDecisionReason: `Do not pipe '${read}' through head or tail. Plan, Activity and Comments print at the end of the output, so a truncated read drops them and leaves you assuming the item has none. Run '${read} <id>' bare and read all of it, or use a focused view: 'assist backlog comments <id>' for comments only.`,
	};
}
