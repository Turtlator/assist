import { randomUUID } from "node:crypto";
import chalk from "chalk";
import { isClaudeCode } from "../../../lib/isClaudeCode";
import { renderMarkdownTerminal } from "../../../shared/renderMarkdownTerminal";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import type { ProposedItem } from "./proposedItemSchema";
import { renderProposedItem } from "./renderProposedItem";

export async function reviewProposal(
	item: ProposedItem,
	sessionId: string | undefined,
	confirmed: boolean,
): Promise<boolean> {
	const body = renderProposedItem(item);

	if (sessionId) {
		await awaitPreviewApproval("Backlog item preview", {
			sessionId,
			requestId: randomUUID(),
			title: item.name,
			body,
			prNumber: null,
			kind: "backlog-item",
			itemType: item.type,
		});
		return true;
	}

	if (isClaudeCode() && confirmed) return true;

	console.log(chalk.bold(item.name));
	console.log(renderMarkdownTerminal(body));

	if (!isClaudeCode()) return true;

	console.log(
		chalk.yellow(
			"Draft only — nothing was written to the backlog. Show this draft in the chat, apply any changes the user asks for, then re-run 'assist backlog propose --json <file|->' with --confirmed to create the item.",
		),
	);
	return false;
}
