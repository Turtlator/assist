import chalk from "chalk";
import { renderMarkdownTerminal } from "../../../shared/renderMarkdownTerminal";
import { findOneItem } from "../shared";
import { printActivity } from "./printActivity";
import { printComments } from "./printComments";
import { printHeader } from "./printHeader";
import { printLinks } from "./printLinks";
import { printPlan } from "./printPlan";
import { printSubtasks } from "./printSubtasks";

function printAcceptanceCriteria(criteria: string[]): void {
	if (criteria.length === 0) return;
	console.log(chalk.bold("Acceptance Criteria"));
	for (const [i, ac] of criteria.entries()) {
		console.log(`  ${i + 1}. ${ac}`);
	}
	console.log();
}

export async function show(
	id: string,
	options: { allCommits?: boolean } = {},
): Promise<void> {
	const found = await findOneItem(id);
	if (!found) process.exit(1);

	const { orm, item } = found;
	printHeader(item);

	if (item.description) {
		console.log(chalk.bold("Description"));
		console.log(renderMarkdownTerminal(item.description));
		console.log();
	}

	printAcceptanceCriteria(item.acceptanceCriteria);
	printSubtasks(item);
	await printLinks(orm, item);
	printComments(item);
	printPlan(item);
	printActivity(item, { allCommits: options.allCommits });
}
