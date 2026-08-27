import { applySetStatus } from "./applySetStatus";
import type { Session, SessionStatus } from "./createSession";
import { rebindClaudeSession } from "./rebindClaudeSession";
import type { OnStatusChange } from "./types";

export type HookStatusReport = {
	id: string;
	status: SessionStatus;
	source?: string;
	claudeSessionId?: string;
};

export function setStatusFromHook(
	sessions: Map<string, Session>,
	report: HookStatusReport,
	notify: () => void,
	onStatusChange: OnStatusChange,
): void {
	applySetStatus(
		sessions,
		report.id,
		report.status,
		report.source,
		onStatusChange,
		(session) =>
			rebindClaudeSession(
				session,
				report.claudeSessionId,
				notify,
				onStatusChange,
			),
	);
}
