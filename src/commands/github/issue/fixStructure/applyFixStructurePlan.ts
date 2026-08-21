import chalk from "chalk";
import { removeIssueLabels } from "./removeIssueLabels";
import type { FixStructurePlan } from "./types";
import { updateIssueType } from "./updateIssueType";
import { writeLineNow } from "./writeLineNow";

export function applyFixStructurePlan(plan: FixStructurePlan): void {
	for (const entry of plan.entries) {
		const where = chalk.cyan(`${entry.issue.repo}#${entry.issue.number}`);
		const { typeChange, labelRemovals } = entry;
		if (typeChange) {
			writeLineNow(
				`${where} type ${typeChange.from ?? "no type"} -> ${typeChange.to}`,
			);
			updateIssueType(entry.issue.id, typeChange.typeId);
		}
		if (labelRemovals.length > 0) {
			writeLineNow(
				`${where} removing ${labelRemovals.map((label) => label.name).join(", ")}`,
			);
			removeIssueLabels(
				entry.issue.id,
				labelRemovals.map((label) => label.id),
			);
		}
	}
}
