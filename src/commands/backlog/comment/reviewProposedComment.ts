import { randomUUID } from "node:crypto";
import { loadConfig } from "../../../shared/loadConfig";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { formatItemId } from "../formatItemId";
import type { BacklogItem } from "../types";

export async function reviewProposedComment(
	item: BacklogItem,
	text: string,
): Promise<void> {
	if (loadConfig().backlog?.previewComments !== true) return;

	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;

	await awaitPreviewApproval("Backlog comment preview", {
		sessionId,
		requestId: randomUUID(),
		title: `Comment on ${formatItemId(item.id)}: ${item.name}`,
		body: text,
		prNumber: null,
		kind: "backlog-comment",
	});
}
