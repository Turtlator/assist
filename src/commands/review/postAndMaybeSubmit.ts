import { promptConfirm } from "../../shared/promptConfirm";
import { setSessionStatus } from "../sessions/setSessionStatus";
import { buildReviewSummary } from "./buildReviewSummary";
import { carriedUnanchoredFindings } from "./carriedUnanchoredFindings";
import type { LineBoundFinding, UnanchoredFinding } from "./partitionFindings";
import { postFindings } from "./postFindings";
import { sanitiseReviewerNames } from "./sanitiseReviewerNames";
import { submitBodyOnlyReview } from "./submitBodyOnlyReview";
import { submitPendingReview } from "./submitPendingReview";

type PostAndMaybeSubmitOptions = {
	prompt: boolean;
	submit: boolean;
};

export type PostOutcome = {
	posted: number;
	submitted: boolean;
};

function buildReviewBody(
	markdown: string,
	unanchored: UnanchoredFinding[],
): string {
	return sanitiseReviewerNames(buildReviewSummary(markdown, unanchored));
}

function submitReview(body: string, posted: number): void {
	if (posted > 0) submitPendingReview(body);
	else submitBodyOnlyReview(body);
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
	unanchored: UnanchoredFinding[],
	markdown: string,
	options: PostAndMaybeSubmitOptions,
): Promise<PostOutcome> {
	const result = postFindings(lineBound);
	const failedSuffix = result.failed > 0 ? `, ${result.failed} failed` : "";
	console.log(`Posted ${result.posted} comment(s)${failedSuffix}.`);
	const carried = carriedUnanchoredFindings(unanchored);
	if (result.posted === 0 && carried.length === 0)
		return { posted: 0, submitted: false };
	const shouldSubmit = await decideSubmit(options);
	if (shouldSubmit) {
		submitReview(buildReviewBody(markdown, unanchored), result.posted);
		return { posted: result.posted, submitted: true };
	}
	console.log("Leaving the review unsubmitted.");
	return { posted: result.posted, submitted: false };
}
