import { existsSync } from "node:fs";
import type { Session } from "../createSession";

export function joinRefusal(session: Session): string | undefined {
	if (session.commandType === "run") return "a server run has no agent stream";
	if (session.closing === true) return "the session is closing";
	if (!session.cwd) return "the session has no working directory";
	if (!existsSync(session.cwd))
		return "the session's workspace no longer exists";
	return undefined;
}
