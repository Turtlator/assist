import { randomUUID } from "node:crypto";
import { emitActivity } from "../shared/emitActivity";
import { spawnClaude } from "../shared/spawnClaude";
import { checkoutPr } from "./review/checkoutPr";

export async function fixConflict(number?: string): Promise<void> {
	if (number) await checkoutPr(number);
	const claudeSessionId = randomUUID();
	emitActivity({
		kind: "command",
		name: "fix-conflict",
		claudeSessionId,
	});
	const { done } = spawnClaude("/fix-conflict", {
		permissionMode: "auto",
		sessionId: claudeSessionId,
	});
	await done;
}
