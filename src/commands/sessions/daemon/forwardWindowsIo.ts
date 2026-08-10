import { logWindowsForward } from "./logWindowsForward";
import { stripWindowsSessionId } from "./toWindowsSessionId";
import type { WindowsConnection } from "./WindowsConnection";

type Msg = Record<string, unknown>;

export function forwardWindowsIo(conn: WindowsConnection, data: Msg): void {
	const sessionId = stripWindowsSessionId(data.sessionId as string);
	const delivered = conn.trySend({ ...data, sessionId });
	logWindowsForward(delivered, data.type, data.sessionId);
}
