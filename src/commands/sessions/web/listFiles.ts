import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { execGit } from "./execGit";
import { getCwdParam } from "./getCwdParam";
import { rankFilePaths } from "./rankFilePaths";

const MAX_RESULTS = 20;
const CACHE_TTL_MS = 5000;
const LS_FILES_MAX_BUFFER = 32 * 1024 * 1024;

type CacheEntry = { files: string[]; expires: number };

const fileListCache = new Map<string, CacheEntry>();

async function repoFiles(cwd: string): Promise<string[]> {
	const cached = fileListCache.get(cwd);
	if (cached && cached.expires > Date.now()) return cached.files;
	const output = await execGit(
		cwd,
		["ls-files", "--cached", "--others", "--exclude-standard"],
		{ maxBuffer: LS_FILES_MAX_BUFFER },
	);
	const files = [...new Set(output.split(/\r?\n/).filter(Boolean))];
	fileListCache.set(cwd, { files, expires: Date.now() + CACHE_TTL_MS });
	return files;
}

export async function listFiles(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const query =
		new URL(req.url ?? "/", "http://localhost").searchParams.get("q") ?? "";
	try {
		const files = await repoFiles(cwd);
		respondJson(res, 200, { files: rankFilePaths(files, query, MAX_RESULTS) });
	} catch {
		respondJson(res, 500, { error: "Failed to list files" });
	}
}
