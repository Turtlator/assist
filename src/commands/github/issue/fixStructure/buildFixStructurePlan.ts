import { type PlanContext, buildPlanEntry } from "./buildPlanEntry";
import { orderDepthFirst } from "./orderDepthFirst";
import type {
	FixStructurePlan,
	PlacedIssue,
	PlanEntry,
	TooDeepIssue,
} from "./types";

type BuildPlanOptions = Omit<PlanContext, "stripLabels"> & {
	stripLabels?: string[];
};

export function buildFixStructurePlan(
	issues: PlacedIssue[],
	options: BuildPlanOptions,
): FixStructurePlan {
	const context = { ...options, stripLabels: options.stripLabels ?? [] };
	const byId = new Map(issues.map((issue) => [issue.id, issue]));
	const entries: PlanEntry[] = [];
	const tooDeep: TooDeepIssue[] = [];

	for (const issue of orderDepthFirst(issues)) {
		const entry = buildPlanEntry(issue, context);
		entries.push(entry);
		if (entry.level === null) {
			tooDeep.push({
				issue,
				parent: issue.parentId ? (byId.get(issue.parentId) ?? null) : null,
			});
		}
	}

	return {
		entries,
		tooDeep,
		typeChangeCount: entries.filter((entry) => entry.typeChange).length,
		labelRemovalCount: entries.reduce(
			(total, entry) => total + entry.labelRemovals.length,
			0,
		),
	};
}
