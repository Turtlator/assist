import { join } from "node:path";
import { readPackageJson } from "../../shared/readPackageJson";
import { runGit } from "./resolveUpstream";

export function readBuiltVersion(cwd?: string): string {
	try {
		const root = runGit(["rev-parse", "--show-toplevel"], cwd);
		return readPackageJson(join(root, "package.json")).version ?? "unknown";
	} catch {
		return "unknown";
	}
}
