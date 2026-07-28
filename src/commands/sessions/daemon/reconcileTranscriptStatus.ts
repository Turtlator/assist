import { deriveTranscriptStatus } from "../shared/deriveTranscriptStatus";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { transcriptTailFingerprint } from "../shared/transcriptTailFingerprint";
import { findSessionJsonlPath } from "../shared/findSessionJsonlPath";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";

async function resolveTranscriptPath(session: Session): Promise<string | null> {
	if (session.transcriptPath) return session.transcriptPath;
	if (!session.claudeSessionId) return null;
	const direct = session.cwd
		? findTranscriptPathSync(session.cwd, session.claudeSessionId)
		: null;
	const filePath =
		direct ?? (await findSessionJsonlPath(session.claudeSessionId));
	if (filePath) session.transcriptPath = filePath;
	return filePath;
}

export async function reconcileTranscriptStatus(
	session: Session,
	onStatusChange: OnStatusChange,
): Promise<void> {
	if (
		session.status === "done" ||
		session.status === "error" ||
		session.status === "stopped"
	)
		return;
	const filePath = await resolveTranscriptPath(session);
	if (!filePath) return;

	const entries = await readTranscriptTail(filePath);
	const fingerprint = transcriptTailFingerprint(entries);
	if (fingerprint !== null && fingerprint === session.transcriptFingerprint)
		return;
	session.transcriptFingerprint = fingerprint ?? undefined;

	const derived = deriveTranscriptStatus(entries, {
		permissionActive: session.permissionActive,
	});
	if (!derived) return;
	if (derived === session.status) return;

	daemonLog(
		`session ${session.id} transcript reconcile: ${session.status} -> ${derived}`,
	);
	onStatusChange(session, derived);
}
