import type { IncomingMessage, ServerResponse } from "node:http";
import { relative } from "node:path";
import { respondJson } from "../../../shared/web";
import { getFileTarget } from "./getFileTarget";
import { revertPathChanges } from "./revertPathChanges";
import { repoRoot } from "./resolveWithinCwd";

export async function revertDiffFile(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const resolved = getFileTarget(req, res);
	if (!resolved) return;
	const path = relative(repoRoot(resolved.cwd), resolved.target);
	try {
		await revertPathChanges(resolved.cwd, path);
		respondJson(res, 200, { reverted: path });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to revert file",
		});
	}
}
