import { readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { formatWithOxfmt } from "./formatWithOxfmt";
import { getFileTarget } from "./getFileTarget";
import { readJsonBody } from "./readJsonBody";
import { repoRoot } from "./resolveWithinCwd";

export async function writeFileContent(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const resolved = getFileTarget(req, res);
	if (!resolved) return;
	let body: { content?: unknown };
	try {
		body = (await readJsonBody(req)) as { content?: unknown };
	} catch {
		respondJson(res, 400, { error: "Invalid JSON body" });
		return;
	}
	if (typeof body.content !== "string") {
		respondJson(res, 400, { error: "Missing content" });
		return;
	}
	try {
		await writeFile(resolved.target, body.content, "utf8");
		await formatWithOxfmt(resolved.target, repoRoot(resolved.cwd));
		respondJson(res, 200, {
			content: await readFile(resolved.target, "utf8"),
		});
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to write file",
		});
	}
}
