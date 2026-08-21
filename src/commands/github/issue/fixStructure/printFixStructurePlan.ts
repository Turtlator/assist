import chalk from "chalk";
import type { FixStructurePlan, PlanEntry } from "./types";
import { writeLineNow } from "./writeLineNow";

function annotate(entry: PlanEntry): string[] {
	const notes: string[] = [];
	if (entry.level === null) {
		notes.push(chalk.red("deeper than the leaf level"));
	} else if (entry.typeChange) {
		notes.push(
			chalk.yellow(
				`${entry.typeChange.from ?? "no type"} -> ${entry.typeChange.to}`,
			),
		);
	} else {
		notes.push(chalk.dim(entry.issue.typeName ?? "no type"));
	}
	for (const label of entry.labelRemovals) {
		notes.push(chalk.yellow(`-${label.name}`));
	}
	return notes;
}

function formatCount(count: number, noun: string): string {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export function printFixStructurePlan(
	plan: FixStructurePlan,
	chain: string[],
	apply: boolean,
): void {
	writeLineNow(chalk.dim(`chain: ${chain.join(" > ")}`));
	for (const entry of plan.entries) {
		const indent = "  ".repeat(entry.issue.depth);
		const name = chalk.cyan(`${entry.issue.repo}#${entry.issue.number}`);
		writeLineNow(
			`${indent}${name} ${entry.issue.title} [${annotate(entry).join(", ")}]`,
		);
	}

	if (plan.typeChangeCount === 0 && plan.labelRemovalCount === 0) {
		writeLineNow(chalk.green("Nothing to change"));
		return;
	}
	writeLineNow(
		`${formatCount(plan.typeChangeCount, "type change")}, ${formatCount(plan.labelRemovalCount, "label removal")} planned`,
	);
	if (!apply) writeLineNow(chalk.dim("Dry run — nothing written"));
}
