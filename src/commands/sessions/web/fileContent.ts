import { readFile, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { isAbsolute, relative, resolve } from "node:path";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { toGitCwd } from "./toGitCwd";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

function resolveWithinCwd(cwd: string, path: string): string | null {
	const root = resolve(toGitCwd(cwd));
	const target = resolve(root, path);
	const rel = relative(root, target);
	if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) return null;
	return target;
}

export async function fileContent(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const path = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"path",
	);
	if (!path) {
		respondJson(res, 400, { error: "Missing path" });
		return;
	}
	const target = resolveWithinCwd(cwd, path);
	if (!target) {
		respondJson(res, 400, { error: "Path outside cwd" });
		return;
	}
	try {
		const info = await stat(target);
		if (!info.isFile()) {
			respondJson(res, 404, { error: "File not found" });
			return;
		}
		if (info.size > MAX_FILE_BYTES) {
			respondJson(res, 413, { error: "File too large" });
			return;
		}
		respondJson(res, 200, { content: await readFile(target, "utf8") });
	} catch {
		respondJson(res, 404, { error: "File not found" });
	}
}
