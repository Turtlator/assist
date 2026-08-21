import chalk from "chalk";
import type { FixStructurePlan, PlanEntry } from "./types";

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
): void {
	console.log(chalk.dim(`chain: ${chain.join(" > ")}`));
	for (const entry of plan.entries) {
		const indent = "  ".repeat(entry.issue.depth);
		const name = chalk.cyan(`${entry.issue.repo}#${entry.issue.number}`);
		console.log(
			`${indent}${name} ${entry.issue.title} [${annotate(entry).join(", ")}]`,
		);
	}

	for (const { issue, parent } of plan.tooDeep) {
		const where = parent ? ` under ${parent.repo}#${parent.number}` : "";
		console.error(
			chalk.red(
				`${issue.repo}#${issue.number}${where} sits below ${chain[chain.length - 1]}, the leaf level`,
			),
		);
	}

	if (plan.typeChangeCount === 0 && plan.labelRemovalCount === 0) {
		console.log(chalk.green("Nothing to change"));
		return;
	}
	console.log(
		`${formatCount(plan.typeChangeCount, "type change")}, ${formatCount(plan.labelRemovalCount, "label removal")} planned`,
	);
	console.log(chalk.dim("Dry run — nothing written"));
}
