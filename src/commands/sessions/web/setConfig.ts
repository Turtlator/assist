import type { IncomingMessage, ServerResponse } from "node:http";
import { applyConfigSet } from "../../config/applyConfigSet";
import { coerceConfigValue } from "../../config/coerceConfigValue";
import { handleConfigWrite } from "./handleConfigWrite";

export function setConfig(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return handleConfigWrite(req, res, (request) => {
		const coerced = coerceConfigValue(request.key, request.value);
		if (!coerced.ok) return { ok: false, errors: [coerced.error] };

		const result = applyConfigSet(
			request.key,
			coerced.value,
			request.global,
			request.cwd,
		);
		return result.ok
			? { ok: true, payload: { target: result.target } }
			: result;
	});
}
