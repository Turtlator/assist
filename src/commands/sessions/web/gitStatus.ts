import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { execGit } from "./execGit";
import { getCwdParam } from "./getCwdParam";
import { getSessionParam } from "./getSessionParam";
import { type ChangeGroup, itemChangeSet } from "./itemChangeSet";
import { parseDiffNameStatus } from "./parseDiffNameStatus";
import { type GitStatusCounts, parseGitStatus } from "./parseGitStatus";

export type ItemStatusCounts = GitStatusCounts & {
	uncommitted?: GitStatusCounts;
	hasCommits?: boolean;
};

async function untrackedPaths(cwd: string): Promise<string[]> {
	const list = await execGit(cwd, [
		"ls-files",
		"--others",
		"--exclude-standard",
	]);
	return list.split("\n").filter(Boolean);
}

async function groupedCounts(
	cwd: string,
	groups: ChangeGroup[],
): Promise<GitStatusCounts> {
	const outputs = await Promise.all(
		groups.map((group) =>
			execGit(cwd, ["diff", "--name-status", group.base, "--", ...group.paths]),
		),
	);
	const counts = parseDiffNameStatus(outputs.join(""));
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
		const changeSet = await itemChangeSet(cwd, getSessionParam(req)).catch(
			() => undefined,
		);
		if (!changeSet) {
			respondJson(res, 200, await workingTreeCounts(cwd));
			return;
		}
		const [counts, uncommitted] = await Promise.all([
			groupedCounts(cwd, changeSet.groups),
			workingTreeCounts(cwd),
		]);
		respondJson(res, 200, {
			...counts,
			uncommitted,
			hasCommits: changeSet.commits.length > 0,
		});
	} catch {
		respondJson(res, 200, { new: [], modified: [], deleted: [] });
	}
}
