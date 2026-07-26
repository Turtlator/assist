import { execSync } from "node:child_process";
import { shellQuote } from "../../shared/shellQuote";

const HEADS_PREFIX = "refs/heads/";

type PushTarget = { remote: string; branch: string; setUpstream: boolean };

export function pushCommit(trunkMode: boolean): void {
	const target = pushTargetForRenamedUpstream(trunkMode);
	const command = target
		? `git push ${target.setUpstream ? "--set-upstream " : ""}${shellQuote(target.remote)} HEAD:${shellQuote(target.branch)}`
		: "git push";
	execSync(command, { stdio: "inherit" });
}

function pushTargetForRenamedUpstream(trunkMode: boolean): PushTarget | null {
	const branch = gitOrNull("git symbolic-ref --short HEAD");
	if (!branch) return null;
	const remote = gitOrNull(
		`git config --get branch.${shellQuote(branch)}.remote`,
	);
	const merge = gitOrNull(
		`git config --get branch.${shellQuote(branch)}.merge`,
	);
	if (!remote || !merge) return null;
	const upstream = merge.startsWith(HEADS_PREFIX)
		? merge.slice(HEADS_PREFIX.length)
		: merge;
	if (upstream === branch) return null;
	return trunkMode
		? landOnTrackedMainline(remote, upstream)
		: raiseOwnRemoteBranch(remote, branch);
}

function landOnTrackedMainline(remote: string, upstream: string): PushTarget {
	return { remote, branch: upstream, setUpstream: false };
}

function raiseOwnRemoteBranch(remote: string, branch: string): PushTarget {
	return { remote, branch, setUpstream: true };
}

function gitOrNull(command: string): string | null {
	try {
		return (
			execSync(command, {
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"],
			}).trim() || null
		);
	} catch {
		return null;
	}
}
