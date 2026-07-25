import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { execGit } from "./execGit";
import { sessionCommitAnchor } from "./sessionCommitAnchor";
import { toGitCwd } from "./toGitCwd";

function baseCandidates(defaultBranch: string | undefined): string[] {
	return [
		defaultBranch && `origin/${defaultBranch}`,
		defaultBranch,
		"origin/main",
		"origin/master",
		"main",
		"master",
	].filter((candidate): candidate is string => Boolean(candidate));
}

async function refExists(cwd: string, ref: string): Promise<boolean> {
	try {
		await execGit(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
		return true;
	} catch {
		return false;
	}
}

async function anchoredBase(
	cwd: string,
	sessionId: string,
): Promise<string | undefined> {
	const { commit, parent } = await sessionCommitAnchor(sessionId);
	if (parent && (await refExists(cwd, parent))) return parent;
	if (commit && (await refExists(cwd, `${commit}^`))) return `${commit}^`;
	return undefined;
}

export async function resolveDiffBase(
	cwd: string,
	sessionId?: string,
): Promise<string> {
	let defaultBranch: string | undefined;
	try {
		const config = loadConfigFrom(toGitCwd(cwd));
		if (!config.sessions?.includeCommittedChanges) return "HEAD";
		defaultBranch = config.branch?.defaultBranch;
	} catch {
		return "HEAD";
	}

	if (sessionId) {
		const anchored = await anchoredBase(cwd, sessionId);
		if (anchored) return anchored;
	}

	for (const candidate of baseCandidates(defaultBranch)) {
		if (!(await refExists(cwd, candidate))) continue;
		try {
			const base = await execGit(cwd, ["merge-base", "HEAD", candidate]);
			const sha = base.trim();
			if (sha) return sha;
		} catch {}
		return "HEAD";
	}
	return "HEAD";
}
