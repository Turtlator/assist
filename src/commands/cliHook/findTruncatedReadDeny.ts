import {
	matchApprovalGatedCommand,
	matchUntruncatableRead,
	TRUNCATOR_BINARIES,
	type UntruncatableRead,
} from "./matchUntruncatableRead";

type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

function startsWithFilter(part: string, filters: string[]): boolean {
	const binary = part.split(/\s+/)[0]?.split("/").pop() ?? "";
	return filters.includes(binary);
}

function pipesToFilter(rawCommand: string, filters: string[]): boolean {
	return new RegExp(`\\|\\s*(?:\\S*/)?(?:${filters.join("|")})\\b`).test(
		rawCommand,
	);
}

function namedFilters(filters: string[]): string {
	return `${filters.slice(0, -1).join(", ")} or ${filters.at(-1)}`;
}

function readDecision(read: UntruncatableRead): HookDecision {
	return {
		permissionDecision: "deny",
		permissionDecisionReason: `Do not pipe '${read.prefix}' through ${namedFilters(read.filters)}. ${read.reason}`,
	};
}

function gatedDecision(gated: string): HookDecision {
	return {
		permissionDecision: "deny",
		permissionDecisionReason: `Do not pipe '${gated}' through head or tail. It gates on a preview the reviewer can reject with inline comments, and those comments print at the end of the output. Nothing persists them, so a truncated read discards the reviewer's feedback for good and they have to retype it. Run '${gated}' bare and read all of it.`,
	};
}

export function findTruncatedReadDeny(
	parts: string[],
): HookDecision | undefined {
	const read = parts.map(matchUntruncatableRead).find(Boolean);
	if (read && parts.some((part) => startsWithFilter(part, read.filters)))
		return readDecision(read);

	const gated = parts.map(matchApprovalGatedCommand).find(Boolean);
	if (gated && parts.some((part) => startsWithFilter(part, TRUNCATOR_BINARIES)))
		return gatedDecision(gated);

	return undefined;
}

export function findTruncatedReadDenyRaw(
	rawCommand: string,
): HookDecision | undefined {
	const read = matchUntruncatableRead(rawCommand);
	if (read && pipesToFilter(rawCommand, read.filters))
		return readDecision(read);

	const gated = matchApprovalGatedCommand(rawCommand);
	if (gated && pipesToFilter(rawCommand, TRUNCATOR_BINARIES))
		return gatedDecision(gated);

	return undefined;
}
