import type { IncomingMessage } from "node:http";
import { readJsonBody } from "./readJsonBody";

type SetConfigBody = {
	key?: unknown;
	value?: unknown;
	cwd?: unknown;
	scope?: unknown;
};

type ParsedSetConfigRequest =
	| { ok: true; key: string; value: unknown; cwd: string; global: boolean }
	| { ok: false; error: string };

export async function parseSetConfigRequest(
	req: IncomingMessage,
): Promise<ParsedSetConfigRequest> {
	let body: SetConfigBody;
	try {
		body = (await readJsonBody(req)) as SetConfigBody;
	} catch {
		return { ok: false, error: "Invalid JSON body" };
	}

	const { key, cwd, scope } = body;
	if (typeof key !== "string" || key === "")
		return { ok: false, error: "Missing key" };
	if (typeof cwd !== "string" || cwd === "")
		return { ok: false, error: "Missing cwd" };
	if (scope !== "project" && scope !== "global")
		return { ok: false, error: 'scope must be "project" or "global"' };

	return { ok: true, key, value: body.value, cwd, global: scope === "global" };
}
