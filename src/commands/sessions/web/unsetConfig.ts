import type { IncomingMessage, ServerResponse } from "node:http";
import { applyConfigUnset } from "../../config/applyConfigUnset";
import { isKnownConfigKey } from "../../config/isKnownConfigKey";
import { handleConfigWrite } from "./handleConfigWrite";

export function unsetConfig(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	return handleConfigWrite(req, res, (request) => {
		if (!isKnownConfigKey(request.key))
			return { ok: false, errors: [`Unknown config key "${request.key}"`] };

		const result = applyConfigUnset(request.key, request.global, request.cwd);
		return result.ok
			? {
					ok: true,
					payload: { target: result.target, removed: result.removed },
				}
			: result;
	});
}
