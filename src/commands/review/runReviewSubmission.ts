import { runGhGraphql } from "../../shared/runGhGraphql";
import { getCurrentPrNodeId, isGhNotInstalled } from "../prs/shared";

export function runReviewSubmission(mutation: string, body: string): void {
	try {
		const prId = getCurrentPrNodeId();
		runGhGraphql(mutation, { prId, body });
		console.log("Submitted review.");
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			return;
		}
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Failed to submit review: ${message}`);
	}
}
