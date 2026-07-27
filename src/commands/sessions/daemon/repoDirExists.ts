import { existsSync } from "node:fs";
import { toGitCwd } from "../web/toGitCwd";

export function repoDirExists(cwd: string): boolean {
	return existsSync(toGitCwd(cwd));
}
