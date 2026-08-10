import chalk from "chalk";
import { resolveCurrentSessionId } from "../sessions/shared/resolveCurrentSessionId";
import { addActivity } from "./addActivity";

export async function recordSession(
	id: string,
	options: { session?: string },
): Promise<void> {
	const sessionId = options.session ?? resolveCurrentSessionId();
	if (!sessionId) {
		console.log(
			chalk.red(
				"Could not determine the current Claude session; pass --session <sessionId>.",
			),
		);
		process.exitCode = 1;
		return;
	}

	await addActivity(id, "session", sessionId, {});
}
