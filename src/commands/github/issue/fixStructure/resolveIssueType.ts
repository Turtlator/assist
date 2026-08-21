import { normaliseTypeName } from "./normaliseTypeName";
import type { IssueType } from "./types";

export function resolveIssueType(
	issueTypes: IssueType[],
	levelName: string,
): IssueType {
	const wanted = normaliseTypeName(levelName);
	const match = issueTypes.find(
		(type) => normaliseTypeName(type.name) === wanted,
	);
	if (!match) {
		throw new Error(
			`The organisation has no ${levelName} issue type. It has ${issueTypes.map((type) => type.name).join(", ")}`,
		);
	}
	return match;
}
