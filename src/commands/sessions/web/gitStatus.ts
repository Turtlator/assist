import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { execGit } from "./execGit";
import { getCwdParam } from "./getCwdParam";
import { getSessionParam } from "./getSessionParam";
import { parseDiffNameStatus } from "./parseDiffNameStatus";
import { type GitStatusCounts, parseGitStatus } from "./parseGitStatus";
import { resolveDiffBase } from "./resolveDiffBase";

async function untrackedPaths(cwd: string): Promise<string[]> {
	const list = await execGit(cwd, [
		"ls-files",
		"--others",
		"--exclude-standard",
	]);
	return list.split("\n").filter(Boolean);
}

async function branchCounts(
	cwd: string,
	base: string,
): Promise<GitStatusCounts> {
	const output = await execGit(cwd, ["diff", "--name-status", base]);
	const counts = parseDiffNameStatus(output);
	counts.new.push(...(await untrackedPaths(cwd)));
	return counts;
}

async function workingTreeCounts(cwd: string): Promise<GitStatusCounts> {
	const output = await execGit(cwd, [
		"status",
		"--porcelain",
		"--untracked-files=all",
	]);
	return parseGitStatus(output);
}

export async function gitStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const base = await resolveDiffBase(cwd, getSessionParam(req));
		respondJson(
			res,
			200,
			base === "HEAD"
				? await workingTreeCounts(cwd)
				: await branchCounts(cwd, base),
		);
	} catch {
		respondJson(res, 200, { new: [], modified: [], deleted: [] });
	}
}
