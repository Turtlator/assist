import { posix } from "node:path";
import { loadConfig } from "./loadConfig";

export function windowsHomeFromWsl(): string | null {
	const projectsRootUnderWinHome = loadConfig().sessions?.windowsProjectsRoot;
	if (!projectsRootUnderWinHome) return null;
	return posix.dirname(posix.dirname(projectsRootUnderWinHome));
}
