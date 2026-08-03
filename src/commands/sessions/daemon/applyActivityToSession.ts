import type { Activity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";

export function applyActivityToSession(
	session: Session,
	activity: Activity,
): void {
	session.activity = activity;
	if (activity.harness) session.harness = activity.harness;
	if (activity.claudeSessionId)
		session.claudeSessionId = activity.claudeSessionId;
}
