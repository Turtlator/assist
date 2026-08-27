import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { respondJson } from "../../../shared/web";
import { readScopedRules } from "../../rules/readScopedRules";
import { getCwdParam } from "./getCwdParam";
import { repoRoot, resolveWithinCwd } from "./resolveWithinCwd";

export function listScopedRules(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const requested = new URL(
		req.url ?? "/",
		"http://localhost",
	).searchParams.get("path");
	const root = repoRoot(cwd);
	const target = requested ? resolveWithinCwd(cwd, requested) : root;
	if (!target) {
		respondJson(res, 400, { error: "Path outside cwd" });
		return;
	}
	try {
		respondJson(res, 200, {
			rules: readScopedRules(target).map((rule) => ({
				...rule,
				source: path.relative(root, rule.source) || rule.source,
			})),
		});
	} catch {
		respondJson(res, 500, { error: "Failed to read rules" });
	}
}
