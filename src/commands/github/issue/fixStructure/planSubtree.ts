import { buildFixStructurePlan } from "./buildFixStructurePlan";
import type { PlanContext } from "./buildPlanEntry";
import type { FixStructurePlan, SubtreeIssue } from "./types";
import { walkSubtree } from "./walkSubtree";

export function planSubtree(
	root: SubtreeIssue,
	context: PlanContext,
): FixStructurePlan {
	const depth = context.chain.length - context.rootLevelIndex;
	return buildFixStructurePlan(walkSubtree(root, depth), context);
}
