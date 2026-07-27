import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { toGitCwd } from "./toGitCwd";

export function includesCommittedChanges(cwd: string): boolean {
	try {
		return (
			loadConfigFrom(toGitCwd(cwd)).sessions?.includeCommittedChanges ?? true
		);
	} catch {
		return true;
	}
}
