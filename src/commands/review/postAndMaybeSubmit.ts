import { promptConfirm } from "../../shared/promptConfirm";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { buildReviewSummary } from "./buildReviewSummary";
import type { LineBoundFinding } from "./partitionFindings";
import { postFindings } from "./postFindings";
import { sanitiseReviewerNames } from "./sanitiseReviewerNames";
import { submitPendingReview } from "./submitPendingReview";

type PostAndMaybeSubmitOptions = {
	prompt: boolean;
	submit: boolean;
};

type PostOutcome = {
	posted: number;
	submitted: boolean;
};

function buildReviewBody(markdown: string): string {
	return sanitiseReviewerNames(buildReviewSummary(markdown));
}

async function decideSubmit(
	options: PostAndMaybeSubmitOptions,
): Promise<boolean> {
	if (!options.prompt) return options.submit;
	await setSessionStatus("waiting");
	try {
		return await promptConfirm("Submit the pending review?", options.submit);
	} finally {
		await setSessionStatus("running");
	}
}

export async function postAndMaybeSubmit(
	lineBound: LineBoundFinding[],
	markdown: string,
	options: PostAndMaybeSubmitOptions,
): Promise<PostOutcome> {
	const result = postFindings(lineBound);
	const failedSuffix = result.failed > 0 ? `, ${result.failed} failed` : "";
	console.log(`Posted ${result.posted} comment(s)${failedSuffix}.`);
	if (result.posted === 0) return { posted: 0, submitted: false };
	const shouldSubmit = await decideSubmit(options);
	if (shouldSubmit) {
		submitPendingReview(buildReviewBody(markdown));
		return { posted: result.posted, submitted: true };
	}
	console.log("Leaving pending review unsubmitted.");
	return { posted: result.posted, submitted: false };
}
