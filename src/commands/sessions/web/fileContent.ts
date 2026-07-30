import { readFile, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getFileTarget } from "./getFileTarget";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export async function fileContent(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const resolved = getFileTarget(req, res);
	if (!resolved) return;
	try {
		const info = await stat(resolved.target);
		if (!info.isFile()) {
			respondJson(res, 404, { error: "File not found" });
			return;
		}
		if (info.size > MAX_FILE_BYTES) {
			respondJson(res, 413, { error: "File too large" });
			return;
		}
		respondJson(res, 200, { content: await readFile(resolved.target, "utf8") });
	} catch {
		respondJson(res, 404, { error: "File not found" });
	}
}
