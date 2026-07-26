import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { getSessionParam } from "./getSessionParam";
import { itemScopeCommits } from "./itemScopeCommits";

export async function diffScopes(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const commits = await itemScopeCommits(cwd, getSessionParam(req));
		respondJson(res, 200, { commits });
	} catch {
		respondJson(res, 200, { commits: [] });
	}
}
