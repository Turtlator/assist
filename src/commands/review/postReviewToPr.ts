import { readFileSync } from "node:fs";
import { promptConfirm } from "../../shared/promptConfirm";
import { chainAfterReview } from "./chainAfterReview";
import { type PostOutcome, postAndMaybeSubmit } from "./postAndMaybeSubmit";
import { selectPostableFindings } from "./selectPostableFindings";
import { stillOnReviewedPr } from "./stillOnReviewedPr";

type PostReviewOptions = {
	prompt: boolean;
	submit: boolean;
	addressComments: boolean;
	announce: boolean;
};

export type PrDiffRef = {
	prNumber: number;
	baseSha: string;
	headSha: string;
};

const NOTHING_POSTED: PostOutcome = { posted: 0, submitted: false };

async function confirmPost(
	prNumber: number,
	count: number,
	options: PostReviewOptions,
): Promise<boolean> {
	if (!options.prompt) return true;
	return promptConfirm(`Post ${count} comment(s) to PR #${prNumber}?`, false);
}

async function postFindingsToPr(
	prInfo: PrDiffRef,
	synthesisPath: string,
	options: PostReviewOptions,
): Promise<PostOutcome> {
	const markdown = readFileSync(synthesisPath, "utf8");
	const inDiff = selectPostableFindings(markdown, prInfo);
	if (inDiff.length === 0) return NOTHING_POSTED;
	console.log(
		`Found PR #${prInfo.prNumber} with ${inDiff.length} line-bound finding(s) in the diff.`,
	);
	const confirmed = await confirmPost(prInfo.prNumber, inDiff.length, options);
	if (!confirmed) {
		console.log("Skipped posting.");
		return NOTHING_POSTED;
	}
	return postAndMaybeSubmit(inDiff, markdown, options);
}

export async function postReviewToPr(
	synthesisPath: string,
	prInfo: PrDiffRef,
	options: PostReviewOptions,
): Promise<void> {
	if (!stillOnReviewedPr(prInfo.prNumber)) return;
	const outcome = await postFindingsToPr(prInfo, synthesisPath, options);
	await chainAfterReview(prInfo.prNumber, outcome, options);
}
