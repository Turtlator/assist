import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function sessionView(_req: IncomingMessage, res: ServerResponse): void {
	const floatWaiting = loadConfig().sessions?.floatWaiting ?? false;
	respondJson(res, 200, { floatWaiting });
}
