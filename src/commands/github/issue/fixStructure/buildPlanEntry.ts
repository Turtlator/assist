import { matchedLabels } from "./matchedLabels";
import { resolveIssueType } from "./resolveIssueType";
import { resolveLevelIndex } from "./resolveLevelIndex";
import type { IssueType, PlacedIssue, PlanEntry } from "./types";

export type PlanContext = {
	chain: string[];
	rootLevelIndex: number;
	rootAsserted: boolean;
	issueTypes: IssueType[];
	stripLabels: string[];
};

export function buildPlanEntry(
	issue: PlacedIssue,
	context: PlanContext,
): PlanEntry {
	const labelRemovals = matchedLabels(issue.labels, context.stripLabels);
	const level = context.chain[context.rootLevelIndex + issue.depth];
	if (level === undefined) {
		return { issue, level: null, typeChange: null, labelRemovals };
	}
	const settled =
		resolveLevelIndex([level], issue.typeName) === 0 ||
		(issue.depth === 0 && !context.rootAsserted);
	if (settled) return { issue, level, typeChange: null, labelRemovals };

	const target = resolveIssueType(context.issueTypes, level);
	return {
		issue,
		level,
		typeChange: { from: issue.typeName, to: target.name, typeId: target.id },
		labelRemovals,
	};
}
