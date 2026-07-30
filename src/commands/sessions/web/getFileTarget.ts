import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { resolveWithinCwd } from "./resolveWithinCwd";

export function getFileTarget(
	req: IncomingMessage,
	res: ServerResponse,
): { cwd: string; target: string } | null {
	const cwd = getCwdParam(req, res);
	if (!cwd) return null;
	const path = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"path",
	);
	if (!path) {
		respondJson(res, 400, { error: "Missing path" });
		return null;
	}
	const target = resolveWithinCwd(cwd, path);
	if (!target) {
		respondJson(res, 400, { error: "Path outside cwd" });
		return null;
	}
	return { cwd, target };
}
