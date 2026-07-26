import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { toGitCwd } from "./toGitCwd";

export function includesCommittedChanges(cwd: string): boolean {
	try {
		return Boolean(
			loadConfigFrom(toGitCwd(cwd)).sessions?.includeCommittedChanges,
		);
	} catch {
		return false;
	}
}
