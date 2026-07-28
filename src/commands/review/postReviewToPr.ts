import { readFileSync } from "node:fs";
import { promptConfirm } from "../../shared/promptConfirm";
import { chainAddressComments } from "./chainAddressComments";
import { fetchPrDiffInfo } from "./fetchPrDiffInfo";
import { postAndMaybeSubmit } from "./postAndMaybeSubmit";
import { selectPostableFindings } from "./selectPostableFindings";

type PostReviewOptions = {
	prompt: boolean;
	submit: boolean;
	addressComments: boolean;
};

async function confirmPost(
	prNumber: number,
	count: number,
	options: PostReviewOptions,
): Promise<boolean> {
	if (!options.prompt) return true;
	return promptConfirm(`Post ${count} comment(s) to PR #${prNumber}?`, false);
}

export async function postReviewToPr(
	synthesisPath: string,
	options: PostReviewOptions,
): Promise<void> {
	const prInfo = fetchPrDiffInfo();
	const prNumber = prInfo.prNumber;
	const markdown = readFileSync(synthesisPath, "utf8");
	const inDiff = selectPostableFindings(markdown, prInfo);
	if (inDiff.length === 0) return;
	console.log(
		`Found PR #${prNumber} with ${inDiff.length} line-bound finding(s) in the diff.`,
	);
	const confirmed = await confirmPost(prNumber, inDiff.length, options);
	if (!confirmed) {
		console.log("Skipped posting.");
		return;
	}
	const outcome = await postAndMaybeSubmit(inDiff, markdown, options);
	if (options.addressComments && outcome.posted > 0 && outcome.submitted)
		await chainAddressComments(prNumber);
}
