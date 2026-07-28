import { requestAssistSession } from "../sessions/shared/requestAssistSession";
import { startChainedSession } from "./startChainedSession";

export function chainAddressComments(
	prNumber: number,
	announce: boolean,
): Promise<void> {
	const args = ["review-pr-comments", String(prNumber)];
	if (announce) args.push("--announce");
	return startChainedSession(
		`an Address Comments session for PR #${prNumber}`,
		() => requestAssistSession(args, process.cwd()),
	);
}
