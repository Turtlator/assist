import { resolveLevelIndex } from "./resolveLevelIndex";

export function resolveRootLevelIndex(
	chain: string[],
	targetTypeName: string | null,
	level: string | undefined,
): { index: number; asserted: boolean } {
	if (level) {
		const index = resolveLevelIndex(chain, level);
		if (index === -1) {
			throw new Error(
				`--level must name one of ${chain.join(", ")}, not "${level}"`,
			);
		}
		return { index, asserted: true };
	}

	const index = resolveLevelIndex(chain, targetTypeName);
	if (index === -1) {
		const has = targetTypeName
			? `has the type ${targetTypeName}, which is not in the ${chain.join(" > ")} chain`
			: "has no issue type";
		throw new Error(
			`The target ${has}, so its level cannot be inferred. Re-run with --level ${chain.map((name) => name.toLowerCase()).join("|")} to assert where it sits.`,
		);
	}
	return { index, asserted: false };
}
