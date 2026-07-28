import { startChainedSession } from "../review/startChainedSession";
import { requestAssistSession } from "../sessions/shared/requestAssistSession";
import { findCurrentPrNumber } from "./shared";

export function chainReviewAndPost(prNumber: number | null): Promise<void> {
	return startChainedSession("a Review + Post session for the PR", () => {
		const number = prNumber ?? findCurrentPrNumber();
		if (number === null)
			throw new Error("no pull request found for the current branch");
		return requestAssistSession(
			[
				"review",
				"--no-prompt",
				"--submit",
				String(number),
				"--address-comments",
				"--announce",
			],
			process.cwd(),
		);
	});
}
