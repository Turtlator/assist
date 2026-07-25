import { existsSync, watch } from "node:fs";
import { daemonLog } from "../daemonLog";
import { gitCommonDir } from "./listWorktreePaths";

const DEBOUNCE_MS = 500;
const POLL_MS = 30_000;

export type StateWatcher = { close: () => void };

export function watchGitState(
	cwd: string,
	onChange: () => void,
): StateWatcher | undefined {
	const common = gitCommonDir(cwd);
	if (!common || !existsSync(common)) return undefined;
	const watchers = [
		watchGitDir(common, onChange),
		pollGitState(cwd, onChange),
	].filter((w): w is StateWatcher => w !== undefined);
	return { close: () => watchers.forEach((w) => w.close()) };
}

function watchGitDir(
	common: string,
	onChange: () => void,
): StateWatcher | undefined {
	let timer: ReturnType<typeof setTimeout> | null = null;
	try {
		const watcher = watch(common, { recursive: true }, () => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(onChange, DEBOUNCE_MS);
		});
		return {
			close: () => {
				if (timer) clearTimeout(timer);
				watcher.close();
			},
		};
	} catch (error) {
		daemonLog(
			`git-state watch unavailable for ${common}, polling only: ${error instanceof Error ? error.message : String(error)}`,
		);
		return undefined;
	}
}

function pollGitState(cwd: string, onChange: () => void): StateWatcher {
	const timer = setInterval(onChange, POLL_MS);
	timer.unref?.();
	daemonLog(`git-state polled every ${POLL_MS / 1000}s for ${cwd}`);
	return { close: () => clearInterval(timer) };
}
