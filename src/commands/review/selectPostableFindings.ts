import { parseFindings } from "./parseFindings";
import { type LineBoundFinding, partitionFindings } from "./partitionFindings";
import { selectInDiffFindings } from "./selectInDiffFindings";
import { warnUnlocated } from "./warnUnlocated";

type PrDiffRef = {
	prNumber: number;
	baseSha: string;
	headSha: string;
};

export function selectPostableFindings(
	markdown: string,
	prInfo: PrDiffRef,
): LineBoundFinding[] {
	const findings = parseFindings(markdown);
	if (findings.length === 0) {
		console.log("Synthesis contains no findings; nothing to post.");
		return [];
	}
	const { lineBound, unlocated, alreadyRaised } = partitionFindings(findings);
	warnUnlocated(unlocated);
	if (alreadyRaised.length > 0) {
		console.log(
			`Skipped ${alreadyRaised.length} finding(s) already raised by prior comments.`,
		);
	}
	if (lineBound.length === 0) {
		console.log("No line-bound findings to post.");
		return [];
	}
	const inDiff = selectInDiffFindings(lineBound, prInfo);
	if (inDiff.length === 0)
		console.log("No findings fall within the PR diff; nothing to post.");
	return inDiff;
}
