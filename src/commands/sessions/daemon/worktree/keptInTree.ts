import { daemonLog } from "../daemonLog";

export function keptInTree(cwd: string, reason: string) {
	daemonLog(`session kept in ${cwd}: ${reason}`);
	return { cwd, kind: "primary" as const, created: false };
}
