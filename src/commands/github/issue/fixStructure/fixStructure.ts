import { buildFixStructurePlan } from "./buildFixStructurePlan";
import { fetchRootIssue } from "./fetchRootIssue";
import { printFixStructurePlan } from "./printFixStructurePlan";
import { resolveFixStructureTarget } from "./resolveFixStructureTarget";
import { resolveOrgIssueTypes } from "./resolveOrgIssueTypes";
import { resolveRootLevelIndex } from "./resolveRootLevelIndex";
import { defaultTypeChain } from "./types";
import { walkSubtree } from "./walkSubtree";

type FixStructureOptions = {
	repo?: string;
	level?: string;
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
		const issueTypes = resolveOrgIssueTypes(resolved.owner);
		const issues = walkSubtree(root, chain.length - index);
		const plan = buildFixStructurePlan(issues, {
			chain,
			rootLevelIndex: index,
			rootAsserted: asserted,
			issueTypes,
		});
		printFixStructurePlan(plan, chain);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}
