import * as os from "node:os";
import * as path from "node:path";

export function claudeProjectsRoot(): string {
	return path.join(os.homedir(), ".claude", "projects");
}

export function projectSlug(cwd: string): string {
	return cwd.replace(/[^a-zA-Z0-9]/g, "-");
}
