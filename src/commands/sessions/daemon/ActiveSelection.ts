import { daemonLog } from "./daemonLog";
import {
	loadActiveSelection,
	saveActiveSelection,
} from "./loadActiveSelection";

/** Per-repo (cwd → sessionId) selected-card map owned by the daemon. */
export class ActiveSelection {
	private readonly byRepo = new Map<string, string>();

	// why: onChange triggers a broadcast only when the selection actually changes
	constructor(private readonly onChange: () => void) {}

	set(cwd: string, sessionId: string): void {
		// why: a web server outside a repo has no cwd, so there is nothing to track
		if (!cwd) return;
		if (this.isAlreadySelected(cwd, sessionId)) return;
		// why: delete-then-set moves this repo to last so the UI can restore the most recently selected card across repos
		this.byRepo.delete(cwd);
		this.byRepo.set(cwd, sessionId);
		daemonLog(`set-active: cwd=${cwd} id=${sessionId}`);
		saveActiveSelection(this.toJSON());
		this.onChange();
	}

	private isAlreadySelected(cwd: string, sessionId: string): boolean {
		if (this.byRepo.get(cwd) !== sessionId) return false;
		return [...this.byRepo.keys()].at(-1) === cwd;
	}

	// why: on daemon restart, reload persisted selections but drop any whose session was not restored
	restore(isLive: (sessionId: string) => boolean): void {
		for (const [cwd, sessionId] of Object.entries(loadActiveSelection()))
			if (isLive(sessionId)) this.byRepo.set(cwd, sessionId);
	}

	toJSON(): Record<string, string> {
		return Object.fromEntries(this.byRepo);
	}
}
