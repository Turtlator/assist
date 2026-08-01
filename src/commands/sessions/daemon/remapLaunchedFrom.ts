import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function remapLaunchedFrom(
	sessions: Map<string, Session>,
	restoredIds: Map<string, string>,
): void {
	for (const session of sessions.values()) {
		const persistedLauncherId = session.launchedFrom;
		if (persistedLauncherId == null) continue;
		const restoredLauncherId = restoredIds.get(persistedLauncherId);
		session.launchedFrom =
			restoredLauncherId === session.id ? undefined : restoredLauncherId;
		logRemap(session, persistedLauncherId);
	}
}

function logRemap(session: Session, persistedLauncherId: string): void {
	daemonLog(
		session.launchedFrom
			? `session ${session.id} relinked to launcher ${persistedLauncherId} -> ${session.launchedFrom}`
			: `session ${session.id} launcher ${persistedLauncherId} was not restored; left at the top level`,
	);
}
