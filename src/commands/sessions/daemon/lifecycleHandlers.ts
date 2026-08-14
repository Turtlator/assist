import { discoverSessions } from "../shared/discoverSessions";
import { parseTranscript } from "../shared/parseTranscript";
import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";
import { withRepoGroups } from "./withRepoGroups";

type Msg = Record<string, unknown>;

function handleHistory(client: SessionClient): void {
	discoverSessions().then((sessions) =>
		sendTo(client, { type: "history", sessions: withRepoGroups(sessions) }),
	);
}

function handleFetchTranscript(
	client: SessionClient,
	_manager: SessionManager,
	data: Msg,
): void {
	const sessionId = data.sessionId as string;
	parseTranscript(sessionId).then((messages) =>
		sendTo(client, { type: "transcript", sessionId, messages }),
	);
}

async function handleShutdown(
	client: SessionClient,
	manager: SessionManager,
): Promise<void> {
	try {
		await manager.flushActiveMs();
		manager.shutdown();
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(`shutdown teardown failed: ${reason}; exiting anyway`);
	}
	sendTo(client, { type: "shutting-down" });
	setImmediate(() => process.exit(0));
}

export const lifecycleHandlers = {
	history: handleHistory,
	"fetch-transcript": handleFetchTranscript,
	shutdown: handleShutdown,
};
