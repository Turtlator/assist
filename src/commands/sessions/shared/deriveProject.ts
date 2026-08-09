import * as path from "node:path";
import type { SessionOrigin } from "./SessionOrigin";

export function deriveProject(
	cwd: string,
	filePath: string,
	origin: SessionOrigin,
): string {
	if (!cwd) return dirNameToProject(filePath);
	// why: POSIX basename mangles Windows cwds like C:\Users\me\repo
	return origin === "windows" ? path.win32.basename(cwd) : path.basename(cwd);
}

function dirNameToProject(filePath: string): string {
	const dirName = path.basename(path.dirname(filePath));
	const parts = dirName.split("--");
	return parts[parts.length - 1].replace(/-/g, "/");
}
