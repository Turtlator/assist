import { watch } from "node:fs";
import { projectDirForCwd } from "../shared/findTranscriptPathSync";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { ensureProjectDirExists } from "./ensureProjectDirExists";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import type { OnStatusChange } from "./types";

const DEBOUNCE_MS = 100;

export function watchTranscript(
	session: Session,
	notify: () => void,
	onStatusChange: OnStatusChange,
): void {
	if (!session.cwd || !session.claudeSessionId) return;
	if (session.watchedTranscriptId === session.claudeSessionId) return;

	const dir = projectDirForCwd(session.cwd);
	if (!ensureProjectDirExists(dir, session.id)) return;

	if (session.transcriptWatcher) {
		session.transcriptWatcher.close();
		session.transcriptWatcher = undefined;
	}
	session.transcriptPath = undefined;
	session.transcriptFingerprint = undefined;

	const fileName = `${session.claudeSessionId}.jsonl`;
	let timer: ReturnType<typeof setTimeout> | null = null;
	const run = () => {
		timer = null;
		void reconcileTranscriptStatus(session, onStatusChange);
		startTranscriptTitleGeneration(session, notify);
	};

	try {
		session.transcriptWatcher = watch(dir, (_event, changed) => {
			if (changed && changed !== fileName) return;
			if (timer) clearTimeout(timer);
			timer = setTimeout(run, DEBOUNCE_MS);
		});
	} catch (error) {
		daemonLog(
			`session ${session.id} transcript watch failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return;
	}
	session.watchedTranscriptId = session.claudeSessionId;
	daemonLog(`session ${session.id} watching transcript ${fileName}`);
	run();
}
