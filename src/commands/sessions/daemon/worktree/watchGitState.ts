import { existsSync, type FSWatcher, watch } from "node:fs";
import { daemonLog } from "../daemonLog";
import { gitCommonDir } from "./git";

const DEBOUNCE_MS = 500;

export function watchGitState(
	cwd: string,
	onChange: () => void,
): FSWatcher | undefined {
	const common = gitCommonDir(cwd);
	if (!common || !existsSync(common)) return undefined;
	let timer: ReturnType<typeof setTimeout> | null = null;
	try {
		return watch(common, { recursive: true }, () => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(onChange, DEBOUNCE_MS);
		});
	} catch (error) {
		daemonLog(
			`git-state watch failed for ${cwd}: ${error instanceof Error ? error.message : String(error)}`,
		);
		return undefined;
	}
}
