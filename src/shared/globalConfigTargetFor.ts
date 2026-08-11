import { existsSync } from "node:fs";
import { posix } from "node:path";
import { shouldProxyToWindows } from "../commands/sessions/daemon/isWindowsCwd";
import { getGlobalConfigPath } from "./loadConfigFrom";
import { windowsHomeFromWsl } from "./windowsHomeFromWsl";

type GlobalConfigTarget =
	| { ok: true; path: string }
	| { ok: false; error: string };

export function globalConfigTargetFor(cwd: string): GlobalConfigTarget {
	if (!shouldProxyToWindows(cwd))
		return { ok: true, path: getGlobalConfigPath() };

	const winHome = windowsHomeFromWsl();
	if (!winHome)
		return {
			ok: false,
			error: `${cwd} runs on the Windows host, whose ~/.assist.yml cannot be located because sessions.windowsProjectsRoot is unset. Set it with: assist config set sessions.windowsProjectsRoot /mnt/c/Users/<you>/.claude/projects`,
		};
	if (!existsSync(winHome))
		return {
			ok: false,
			error: `${cwd} runs on the Windows host, whose home ${winHome} is not reachable from here. Check that the Windows drive is mounted and sessions.windowsProjectsRoot points at it.`,
		};
	return { ok: true, path: posix.join(winHome, ".assist.yml") };
}
