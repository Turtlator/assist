import type { IncomingMessage, ServerResponse } from "node:http";
import { relative } from "node:path";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { readJsonBody } from "./readJsonBody";
import { revertPathChanges } from "./revertPathChanges";
import { repoRoot, resolveWithinCwd } from "./resolveWithinCwd";

function requestedPaths(body: unknown): string[] | null {
	const paths = (body as { paths?: unknown }).paths;
	if (!Array.isArray(paths)) return null;
	if (paths.some((path) => typeof path !== "string")) return null;
	return paths as string[];
}

export async function revertDiffPaths(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;

	let paths: string[] | null;
	try {
		paths = requestedPaths(await readJsonBody(req));
	} catch {
		respondJson(res, 400, { error: "Invalid JSON body" });
		return;
	}
	if (!paths) {
		respondJson(res, 400, { error: "Missing paths" });
		return;
	}

	const root = repoRoot(cwd);
	const reverted: string[] = [];
	const failed: { path: string; error: string }[] = [];

	for (const path of paths) {
		const target = resolveWithinCwd(cwd, path);
		if (!target) {
			failed.push({ path, error: "Path outside cwd" });
			continue;
		}
		const relativePath = relative(root, target);
		try {
			await revertPathChanges(cwd, relativePath);
			reverted.push(relativePath);
		} catch (error) {
			failed.push({
				path: relativePath,
				error: error instanceof Error ? error.message : "Failed to revert file",
			});
		}
	}

	respondJson(res, 200, { reverted, failed });
}
