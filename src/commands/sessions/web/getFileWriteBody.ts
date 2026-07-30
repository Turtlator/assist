import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { readJsonBody } from "./readJsonBody";

export async function getFileWriteBody(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<{ content: string; mtimeMs: number } | null> {
	let body: { content?: unknown; mtimeMs?: unknown };
	try {
		body = (await readJsonBody(req)) as {
			content?: unknown;
			mtimeMs?: unknown;
		};
	} catch {
		respondJson(res, 400, { error: "Invalid JSON body" });
		return null;
	}
	if (typeof body.content !== "string") {
		respondJson(res, 400, { error: "Missing content" });
		return null;
	}
	if (typeof body.mtimeMs !== "number") {
		respondJson(res, 400, { error: "Missing mtimeMs" });
		return null;
	}
	return { content: body.content, mtimeMs: body.mtimeMs };
}
