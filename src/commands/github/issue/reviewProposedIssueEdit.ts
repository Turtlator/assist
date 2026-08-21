import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";

type IssueWorkingCopy = {
	path: string;
	save: (edited: string) => void;
};

export async function reviewProposedIssueEdit(
	title: string,
	body: string,
	working: IssueWorkingCopy,
): Promise<string> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return body;

	const decision = await awaitPreviewApproval(
		"GitHub issue edit preview",
		{
			sessionId,
			requestId: randomUUID(),
			title,
			body,
			prNumber: null,
			kind: "github-issue-edit",
		},
		{
			saveEditedBody: working.save,
			rejectionAdvice: `Nothing was pushed. The pane's markdown, including any collapses already applied, is at ${working.path}. Revise that file in place — do not recompose the body from scratch — then re-run this command to preview the revision.`,
		},
	);

	return decision.body ?? body;
}
