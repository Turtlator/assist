import { requestClaudeSession } from "../sessions/shared/requestClaudeSession";
import { startChainedSession } from "./startChainedSession";

export function announcePr(prNumber: number): Promise<void> {
	return startChainedSession(
		`a Slack announce session for PR #${prNumber}`,
		() =>
			requestClaudeSession(
				`/prs-slack ${prNumber} --no-confirm`,
				process.cwd(),
				{ inPlace: true },
			),
	);
}
