import { randomUUID } from "node:crypto";
import { emitActivity } from "../shared/emitActivity";
import { spawnClaude } from "../shared/spawnClaude";
import { resumeNudge } from "./backlog/resumeNudge";
import { checkoutPr } from "./review/checkoutPr";

type FixConflictOptions = {
	rebase?: boolean;
	resumeSessionId?: string;
};

function buildPrompt(rebase: boolean): string {
	return rebase ? "/fix-conflict --rebase" : "/fix-conflict";
}

export async function fixConflict(
	number?: string,
	options: FixConflictOptions = {},
): Promise<void> {
	const { resumeSessionId } = options;
	if (number && !resumeSessionId) await checkoutPr(number);
	const claudeSessionId = resumeSessionId ?? randomUUID();
	emitActivity({
		kind: "command",
		name: "fix-conflict",
		claudeSessionId,
	});
	const { done } = spawnClaude(
		resumeSessionId ? resumeNudge() : buildPrompt(options.rebase === true),
		{
			permissionMode: "auto",
			sessionId: claudeSessionId,
			resumeSessionId,
		},
	);
	await done;
}
