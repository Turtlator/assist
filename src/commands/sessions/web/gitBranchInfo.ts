import { defaultBranchRef } from "./defaultBranchRef";
import { execGit } from "./execGit";

export type GitBranchInfo = {
	branch: string | null;
	defaultBranch: string | null;
	onDefaultBranch: boolean;
};

const CACHE_TTL_MS = 30_000;

const EMPTY: GitBranchInfo = {
	branch: null,
	defaultBranch: null,
	onDefaultBranch: false,
};

const cache = new Map<string, { value: GitBranchInfo; expires: number }>();

async function currentBranch(cwd: string): Promise<string | null> {
	try {
		const branch = (
			await execGit(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])
		).trim();
		return branch && branch !== "HEAD" ? branch : null;
	} catch {
		return null;
	}
}

async function resolve(cwd: string): Promise<GitBranchInfo> {
	const [branch, defaultRef] = await Promise.all([
		currentBranch(cwd),
		defaultBranchRef(cwd).catch(() => undefined),
	]);
	const defaultBranch = defaultRef ?? null;
	return {
		branch,
		defaultBranch,
		onDefaultBranch:
			branch !== null &&
			defaultBranch !== null &&
			defaultBranch === `origin/${branch}`,
	};
}

export async function gitBranchInfo(cwd: string): Promise<GitBranchInfo> {
	const now = Date.now();
	const cached = cache.get(cwd);
	if (cached && cached.expires > now) return cached.value;

	let value = EMPTY;
	try {
		value = await resolve(cwd);
	} catch {
		value = EMPTY;
	}
	cache.set(cwd, { value, expires: now + CACHE_TTL_MS });
	return value;
}
