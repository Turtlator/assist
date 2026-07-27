import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { execGit } from "./execGit";
import { toGitCwd } from "./toGitCwd";

const ORIGIN_HEAD_REF = "refs/remotes/origin/HEAD";
const ORIGIN_REF_PREFIX = "refs/remotes/origin/";

function configuredDefaultBranch(cwd: string): string | undefined {
	try {
		return loadConfigFrom(toGitCwd(cwd)).branch?.defaultBranch;
	} catch {
		return undefined;
	}
}

async function originHeadBranch(cwd: string): Promise<string | undefined> {
	try {
		const ref = (
			await execGit(cwd, ["symbolic-ref", "--quiet", ORIGIN_HEAD_REF])
		).trim();
		if (!ref.startsWith(ORIGIN_REF_PREFIX)) return undefined;
		return ref.slice(ORIGIN_REF_PREFIX.length) || undefined;
	} catch {
		return undefined;
	}
}

export async function defaultBranchRef(
	cwd: string,
): Promise<string | undefined> {
	const branch = configuredDefaultBranch(cwd) ?? (await originHeadBranch(cwd));
	if (!branch) return undefined;
	const ref = `origin/${branch}`;
	try {
		await execGit(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
		return ref;
	} catch {
		return undefined;
	}
}
