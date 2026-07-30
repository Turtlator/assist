import { readFile, stat, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { formatWithOxfmt } from "./formatWithOxfmt";
import { getFileTarget } from "./getFileTarget";
import { getFileWriteBody } from "./getFileWriteBody";
import { repoRoot } from "./resolveWithinCwd";

const STALE_MESSAGE = "The file changed on disk since it was opened";

async function currentMtimeMs(target: string): Promise<number | null> {
	try {
		return (await stat(target)).mtimeMs;
	} catch {
		return null;
	}
}

export async function writeFileContent(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const resolved = getFileTarget(req, res);
	if (!resolved) return;
	const body = await getFileWriteBody(req, res);
	if (!body) return;
	if ((await currentMtimeMs(resolved.target)) !== body.mtimeMs) {
		respondJson(res, 409, { error: STALE_MESSAGE });
		return;
	}
	try {
		await writeFile(resolved.target, body.content, "utf8");
		await formatWithOxfmt(resolved.target, repoRoot(resolved.cwd));
		respondJson(res, 200, {
			content: await readFile(resolved.target, "utf8"),
			mtimeMs: await currentMtimeMs(resolved.target),
		});
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to write file",
		});
	}
}
