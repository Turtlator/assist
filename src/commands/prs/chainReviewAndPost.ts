import { startChainedSession } from "../review/startChainedSession";
import { requestAssistSession } from "../sessions/shared/requestAssistSession";

export function chainReviewAndPost(
	prNumber: number,
	announce: boolean,
): Promise<void> {
	const args = [
		"review",
		"--no-prompt",
		"--submit",
		String(prNumber),
		"--address-comments",
	];
	if (announce) args.push("--announce");
	return startChainedSession(
		`a Review + Post session for PR #${prNumber}`,
		() => requestAssistSession(args, process.cwd(), { inPlace: true }),
	);
}
