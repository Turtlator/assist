import { assertNothingTooDeep } from "./assertNothingTooDeep";
import type { FixStructurePlan, PlanEntry } from "./types";

function describe(entry: PlanEntry): string[] {
	const where = `${entry.issue.repo}#${entry.issue.number}`;
	const notes: string[] = [];
	if (entry.typeChange) {
		notes.push(
			`${where} is still ${entry.typeChange.from ?? "untyped"}, not ${entry.typeChange.to}`,
		);
	}
	for (const label of entry.labelRemovals) {
		notes.push(`${where} still carries ${label.name}`);
	}
	return notes;
}

export function assertNoResidualDrift(
	plan: FixStructurePlan,
	chain: string[],
): void {
	assertNothingTooDeep(plan.tooDeep, chain);
	const residual = plan.entries.flatMap(describe);
	if (residual.length === 0) return;
	throw new Error(
		["The subtree still drifts after applying:", ...residual].join("\n"),
	);
}
