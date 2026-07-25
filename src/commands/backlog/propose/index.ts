import { randomUUID } from "node:crypto";
import chalk from "chalk";
import { renderMarkdownTerminal } from "../../../shared/renderMarkdownTerminal";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { createItemWithDefaults } from "../createItemWithDefaults";
import { ensureRemoteOrigin } from "../ensureRemoteOrigin";
import { formatItemId } from "../formatItemId";
import type { ProposedItem } from "./proposedItemSchema";
import { readProposedItem } from "./readProposedItem";
import { renderProposedItem } from "./renderProposedItem";

async function reviewProposal(item: ProposedItem): Promise<void> {
	const body = renderProposedItem(item);
	const sessionId = process.env.ASSIST_SESSION_ID;

	if (process.env.ASSIST_SESSION === "1" && sessionId) {
		await awaitPreviewApproval("Backlog item preview", {
			sessionId,
			requestId: randomUUID(),
			title: item.name,
			body,
			prNumber: null,
			kind: "backlog-item",
			itemType: item.type,
		});
		return;
	}

	console.log(chalk.bold(item.name));
	console.log(renderMarkdownTerminal(body));
}

export async function propose(options: { json: string }): Promise<void> {
	if (!ensureRemoteOrigin()) return;

	const item = await readProposedItem(options.json);

	await reviewProposal(item);

	const id = await createItemWithDefaults(item);
	console.log(chalk.green(`Added item ${formatItemId(id)}: ${item.name}`));
}
