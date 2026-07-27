import chalk from "chalk";
import { groupActivityRefs } from "../groupActivityRefs";
import type { BacklogItem, GitRef } from "../types";

function printRef(label: string, text: string, ref: GitRef): void {
	const url = ref.url ? ` ${chalk.dim(ref.url)}` : "";
	console.log(`  ${chalk.cyan(label)} ${text}${url}`);
}

export function printActivity(
	item: BacklogItem,
	options: { allCommits?: boolean } = {},
): void {
	const { branches, commits, overflowCommits, prs, slacks } = groupActivityRefs(
		item.gitRefs ?? [],
		options.allCommits ? Number.POSITIVE_INFINITY : undefined,
	);
	if (branches.length + commits.length + prs.length + slacks.length === 0)
		return;

	console.log(chalk.bold("Activity"));
	for (const branch of branches) {
		printRef("branch", branch.ref, branch);
	}
	for (const commit of commits) {
		const subject = commit.title ? ` ${commit.title}` : "";
		printRef("commit", `${commit.ref.slice(0, 8)}${subject}`, commit);
	}
	if (overflowCommits.length > 0) {
		console.log(
			`  ${chalk.dim(`… and ${overflowCommits.length} more commits (--all-commits to show)`)}`,
		);
	}
	for (const pr of prs) {
		const title = pr.title ? ` ${pr.title}` : "";
		const state = pr.state
			? ` ${chalk.dim(`(${pr.state.toLowerCase()})`)}`
			: "";
		printRef("pr", `#${pr.ref}${title}${state}`, pr);
	}
	for (const slack of slacks) {
		printRef("slack", slack.title ?? slack.ref, slack);
	}
	console.log();
}
