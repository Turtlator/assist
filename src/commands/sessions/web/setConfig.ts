import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { applyConfigSet } from "../../config/applyConfigSet";
import { coerceConfigValue } from "../../config/coerceConfigValue";
import { parseSetConfigRequest } from "./parseSetConfigRequest";

export async function setConfig(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const parsed = await parseSetConfigRequest(req);
	if (!parsed.ok) {
		respondJson(res, 400, { error: parsed.error });
		return;
	}

	const coerced = coerceConfigValue(parsed.key, parsed.value);
	if (!coerced.ok) {
		respondJson(res, 400, { error: coerced.error, errors: [coerced.error] });
		return;
	}

	try {
		const result = applyConfigSet(
			parsed.key,
			coerced.value,
			parsed.global,
			parsed.cwd,
		);
		if (!result.ok) {
			respondJson(res, 400, {
				error: result.errors.join("\n"),
				errors: result.errors,
			});
			return;
		}
		respondJson(res, 200, { target: result.target });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to save config",
		});
	}
}
