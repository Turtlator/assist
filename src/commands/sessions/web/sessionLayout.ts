import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";

export function sessionLayout(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const topBar = loadConfig().sessions?.topBar === true;
	respondJson(res, 200, { topBar });
}
