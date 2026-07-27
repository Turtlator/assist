import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { sessionViewDefaults } from "../shared/sessionViewDefaults";

export function sessionView(_req: IncomingMessage, res: ServerResponse): void {
	const sessions = loadConfig().sessions;
	respondJson(res, 200, {
		floatWaiting: sessions?.floatWaiting ?? sessionViewDefaults.floatWaiting,
		floatWaitingAfterMs:
			sessions?.floatWaitingAfterMs ?? sessionViewDefaults.floatWaitingAfterMs,
	});
}
