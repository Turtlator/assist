import type { PreviewDecision } from "./parsePreviewDecision";
import { reportPreviewRejection } from "./reportPreviewRejection";
import {
	type PreviewRequest,
	requestPreviewDecision,
} from "./requestPreviewDecision";

export async function awaitPreviewApproval(
	subject: string,
	request: PreviewRequest,
): Promise<PreviewDecision> {
	console.log("Awaiting your approval in the assist web UI preview pane…");

	let decision: PreviewDecision;
	try {
		decision = await requestPreviewDecision(request);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}

	if (decision.decision === "reject") reportPreviewRejection(subject, decision);

	return decision;
}
