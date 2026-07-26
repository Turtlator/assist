import { execGit } from "./execGit";

const GIT_EMPTY_TREE_HASH = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

export async function resolveCommit(
	cwd: string,
	sha: string,
): Promise<{ base: string; paths: string[] } | undefined> {
	if (!(await commitExists(cwd, sha))) return undefined;
	const parent = await parentOf(cwd, sha);
	return {
		base: parent ?? GIT_EMPTY_TREE_HASH,
		paths: await commitPaths(cwd, sha),
	};
}

async function commitExists(cwd: string, sha: string): Promise<boolean> {
	try {
		await execGit(cwd, ["cat-file", "-e", `${sha}^{commit}`]);
		return true;
	} catch {
		return false;
	}
}

async function parentOf(cwd: string, sha: string): Promise<string | undefined> {
	try {
		const parent = await execGit(cwd, [
			"rev-parse",
			"--verify",
			"--quiet",
			`${sha}^`,
		]);
		return parent.trim() || undefined;
	} catch {
		return undefined;
	}
}

async function commitPaths(cwd: string, sha: string): Promise<string[]> {
	try {
		const output = await execGit(cwd, [
			"diff-tree",
			"--no-commit-id",
			"--name-only",
			"-r",
			"--root",
			sha,
		]);
		return output.split("\n").filter(Boolean);
	} catch {
		return [];
	}
}
