import { execSync } from "node:child_process";
import { shellQuote } from "../../shared/shellQuote";

const HEADS_PREFIX = "refs/heads/";

export function pushCommit(): void {
	const target = renamedUpstream();
	const command = target
		? `git push ${shellQuote(target.remote)} HEAD:${shellQuote(target.branch)}`
		: "git push";
	execSync(command, { stdio: "inherit" });
}

function renamedUpstream(): { remote: string; branch: string } | null {
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
	return upstream === branch ? null : { remote, branch: upstream };
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
