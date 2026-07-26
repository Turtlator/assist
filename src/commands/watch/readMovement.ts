import { type Movement, detectMovement } from "./detectMovement";
import { runGit } from "./resolveUpstream";

export function readMovement(cwd?: string): Movement | undefined {
	try {
		const from = runGit(["rev-parse", "@"], cwd);
		const to = runGit(["rev-parse", "@{u}"], cwd);
		const count = Number(runGit(["rev-list", "--count", "@..@{u}"], cwd));
		return detectMovement(from, to, count);
	} catch {
		return undefined;
	}
}
