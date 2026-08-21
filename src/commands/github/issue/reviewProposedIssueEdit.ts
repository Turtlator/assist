import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";

export async function reviewProposedIssueEdit(
	title: string,
	body: string,
): Promise<boolean> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return false;

	await awaitPreviewApproval("GitHub issue edit preview", {
		sessionId,
		requestId: randomUUID(),
		title,
		body,
		prNumber: null,
		kind: "github-issue-edit",
	});
	return true;
}
