import { itemScopeCommits } from "./itemScopeCommits";

export type DiffScope =
	| { kind: "all" }
	| { kind: "uncommitted" }
	| { kind: "commit"; sha: string };

export async function resolveDiffScope(
	cwd: string,
	sessionId: string | undefined,
	scope: string | undefined,
): Promise<DiffScope | undefined> {
	if (!scope || scope === "all") return { kind: "all" };
	if (scope === "uncommitted") return { kind: "uncommitted" };
	const commits = await itemScopeCommits(cwd, sessionId);
	if (!commits.some((commit) => commit.sha === scope)) return undefined;
	return { kind: "commit", sha: scope };
}
