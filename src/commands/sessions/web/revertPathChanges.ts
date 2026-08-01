import { execGit } from "./execGit";

async function isTracked(cwd: string, path: string): Promise<boolean> {
	try {
		await execGit(cwd, ["ls-files", "--error-unmatch", "--", path]);
		return true;
	} catch {
		return false;
	}
}

async function isInHead(cwd: string, path: string): Promise<boolean> {
	const listing = await execGit(cwd, ["ls-tree", "HEAD", "--", path]);
	return listing.trim().length > 0;
}

export async function revertPathChanges(
	cwd: string,
	path: string,
): Promise<void> {
	if (!(await isTracked(cwd, path))) {
		await execGit(cwd, ["clean", "-f", "--", path]);
		return;
	}
	if (await isInHead(cwd, path)) {
		await execGit(cwd, ["checkout", "HEAD", "--", path]);
		return;
	}
	await execGit(cwd, ["rm", "-f", "--", path]);
}
