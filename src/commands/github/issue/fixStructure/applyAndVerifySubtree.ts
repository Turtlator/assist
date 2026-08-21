import chalk from "chalk";
import { applyFixStructurePlan } from "./applyFixStructurePlan";
import { assertNoResidualDrift } from "./assertNoResidualDrift";
import type { PlanContext } from "./buildPlanEntry";
import { fetchRootIssue } from "./fetchRootIssue";
import { planSubtree } from "./planSubtree";
import type { FixStructureTarget } from "./resolveFixStructureTarget";
import type { FixStructurePlan } from "./types";
import { writeLineNow } from "./writeLineNow";

export function applyAndVerifySubtree(
	target: FixStructureTarget,
	plan: FixStructurePlan,
	context: PlanContext,
): void {
	if (plan.typeChangeCount === 0 && plan.labelRemovalCount === 0) return;
	applyFixStructurePlan(plan);
	writeLineNow(chalk.dim("Re-walking the subtree to confirm"));
	assertNoResidualDrift(
		planSubtree(fetchRootIssue(target), context),
		context.chain,
	);
	writeLineNow(chalk.green("Subtree normalised"));
}
