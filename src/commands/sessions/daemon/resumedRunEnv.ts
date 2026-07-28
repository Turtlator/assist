import { isPausePending } from "../../backlog/consumePause";

export function resumedRunEnv(
	itemId: number | undefined,
	idle: boolean,
): Record<string, string> | undefined {
	const env: Record<string, string> = {};
	if (idle) env.ASSIST_RESUME_IDLE = "1";
	if (itemId != null && isPausePending(itemId)) env.ASSIST_KEEP_PAUSE = "1";
	return Object.keys(env).length > 0 ? env : undefined;
}
