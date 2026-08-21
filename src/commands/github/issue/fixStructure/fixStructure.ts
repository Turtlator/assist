import { applyAndVerifySubtree } from "./applyAndVerifySubtree";
import { assertNothingTooDeep } from "./assertNothingTooDeep";
import { fetchRootIssue } from "./fetchRootIssue";
import { planSubtree } from "./planSubtree";
import { printFixStructurePlan } from "./printFixStructurePlan";
import { resolveFixStructureTarget } from "./resolveFixStructureTarget";
import { resolveOrgIssueTypes } from "./resolveOrgIssueTypes";
import { resolveRootLevelIndex } from "./resolveRootLevelIndex";
import { defaultTypeChain } from "./types";

type FixStructureOptions = {
	repo?: string;
	level?: string;
	apply?: boolean;
};

export function fixStructure(
	target: string,
	options: FixStructureOptions,
): void {
	const chain = defaultTypeChain;
	try {
		const resolved = resolveFixStructureTarget(target, options.repo);
		const root = fetchRootIssue(resolved);
		const { index, asserted } = resolveRootLevelIndex(
			chain,
			root.typeName,
			options.level,
		);
		const context = {
			chain,
			rootLevelIndex: index,
			rootAsserted: asserted,
			issueTypes: resolveOrgIssueTypes(resolved.owner),
			stripLabels: [],
		};
		const plan = planSubtree(root, context);
		printFixStructurePlan(plan, chain, options.apply === true);
		assertNothingTooDeep(plan.tooDeep, chain);
		if (options.apply) applyAndVerifySubtree(resolved, plan, context);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}
