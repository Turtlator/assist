import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { execGit } from "./execGit";
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

export async function resolveDiffBase(cwd: string): Promise<string> {
	let defaultBranch: string | undefined;
	try {
		const config = loadConfigFrom(toGitCwd(cwd));
		if (!config.sessions?.includeCommittedChanges) return "HEAD";
		defaultBranch = config.branch?.defaultBranch;
	} catch {
		return "HEAD";
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
