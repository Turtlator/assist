import { randomUUID } from "node:crypto";
import { emitActivity } from "../shared/emitActivity";
import { spawnClaude } from "../shared/spawnClaude";
import { checkoutPr } from "./review/checkoutPr";

export async function reviewPrComments(number?: string): Promise<void> {
	if (number) await checkoutPr(number);
	/* why: assign the conversation id up front and report it via activity so the
	 * daemon binds the card to this transcript rather than guessing via the cwd
	 * poller, which races concurrent sessions in the same repo (#413). */
	const claudeSessionId = randomUUID();
	emitActivity({
		kind: "command",
		name: "review-pr-comments",
		claudeSessionId,
	});
	const { done } = spawnClaude("/review-pr-comments", {
		permissionMode: "acceptEdits",
		sessionId: claudeSessionId,
	});
	await done;
}
