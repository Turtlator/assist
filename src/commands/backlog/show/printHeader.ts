import chalk from "chalk";
import { formatItemId } from "../formatItemId";
import { shortenGithubIssue } from "../shortenGithubIssue";
import type { BacklogItem } from "../types";

export function printHeader(item: BacklogItem): void {
	console.log(chalk.bold(`${formatItemId(item.id)} ${item.name}`));
	const commentCount = item.comments?.length ?? 0;
	const comments =
		commentCount > 0 ? `  ${chalk.dim("Comments:")} ${commentCount}` : "";
	console.log(
		`${chalk.dim("Type:")} ${item.type}  ${chalk.dim("Status:")} ${item.status}${comments}`,
	);
	if (item.jiraKey) {
		console.log(`${chalk.dim("Jira:")} ${item.jiraKey}`);
	}
	if (item.githubIssue) {
		console.log(
			`${chalk.dim("GitHub:")} ${shortenGithubIssue(item.githubIssue, item.origin)}`,
		);
	}
	console.log();
}
