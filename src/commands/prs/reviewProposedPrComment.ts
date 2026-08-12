import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";

export async function reviewProposedPrComment(
	title: string,
	body: string,
	prNumber: number | null,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;

	await awaitPreviewApproval("PR comment preview", {
		sessionId,
		requestId: randomUUID(),
		title,
		body,
		prNumber,
		kind: "pr-comment",
	});
}
