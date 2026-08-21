import { normaliseTypeName } from "./normaliseTypeName";
import type { IssueType } from "./types";

export function assertChainTypesExist(
	chain: string[],
	issueTypes: IssueType[],
): void {
	const missing = chain.filter(
		(level) =>
			!issueTypes.some(
				(type) => normaliseTypeName(type.name) === normaliseTypeName(level),
			),
	);
	if (missing.length === 0) return;
	throw new Error(
		`The organisation has no ${missing.join(", ")} issue type${missing.length === 1 ? "" : "s"}. It has ${issueTypes.map((type) => type.name).join(", ")}`,
	);
}
