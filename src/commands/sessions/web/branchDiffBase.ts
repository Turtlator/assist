import { defaultBranchRef } from "./defaultBranchRef";
import { execGit } from "./execGit";

export async function branchDiffBase(cwd: string): Promise<string | undefined> {
	const ref = await defaultBranchRef(cwd);
	if (!ref) return undefined;
	try {
		const base = await execGit(cwd, ["merge-base", ref, "HEAD"]);
		return base.trim() || undefined;
	} catch {
		return undefined;
	}
}
