import { randomUUID } from "node:crypto";
import { emitActivity } from "../shared/emitActivity";
import { spawnClaude } from "../shared/spawnClaude";
import { resumeNudge } from "./backlog/resumeNudge";
import { checkoutPr } from "./review/checkoutPr";

type ReviewPrCommentsOptions = {
	announce?: boolean;
	resumeSessionId?: string;
};

function buildPrompt(number: string | undefined, announce: boolean): string {
	if (!announce) return "/review-pr-comments";
	return `/review-pr-comments --announce ${number}`;
}

function validateAnnounce(number: string | undefined, announce: boolean): void {
	if (!announce || number) return;
	console.error("Error: --announce requires a PR number.");
	process.exit(1);
}

export async function reviewPrComments(
	number?: string,
	options: ReviewPrCommentsOptions = {},
): Promise<void> {
	const announce = options.announce === true;
	const resumeSessionId = options.resumeSessionId;
	validateAnnounce(number, announce);
	if (number && !resumeSessionId) await checkoutPr(number);
	/* why: assign the conversation id up front and report it via activity so the
	 * daemon binds the card to this transcript rather than guessing via the cwd
	 * poller, which races concurrent sessions in the same repo (#413). */
	const claudeSessionId = resumeSessionId ?? randomUUID();
	emitActivity({
		kind: "command",
		name: "review-pr-comments",
		claudeSessionId,
	});
	const { done } = spawnClaude(
		resumeSessionId ? resumeNudge() : buildPrompt(number, announce),
		{
			permissionMode: "acceptEdits",
			sessionId: claudeSessionId,
			resumeSessionId,
		},
	);
	await done;
}
