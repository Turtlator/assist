import type { IncomingMessage, ServerResponse } from "node:http";
import type { CommitRef } from "../../../shared/db/listCommitRefs";
import { respondJson } from "../../../shared/web";
import { defaultBranchRef } from "./defaultBranchRef";
import { getCwdParam } from "./getCwdParam";
import { getSessionParam } from "./getSessionParam";
import { itemScopeCommits } from "./itemScopeCommits";

async function scopeCommits(
	cwd: string,
	sessionId: string | undefined,
): Promise<CommitRef[]> {
	try {
		return await itemScopeCommits(cwd, sessionId);
	} catch {
		return [];
	}
}

async function branchBase(cwd: string): Promise<string | null> {
	try {
		return (await defaultBranchRef(cwd)) ?? null;
	} catch {
		return null;
	}
}

export async function diffScopes(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const [commits, base] = await Promise.all([
		scopeCommits(cwd, getSessionParam(req)),
		branchBase(cwd),
	]);
	respondJson(res, 200, { commits, branchBase: base });
}
