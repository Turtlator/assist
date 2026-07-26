import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { extractFirstUserMessage } from "../summarise/extractFirstUserMessage";
import { daemonLog } from "./daemonLog";
import { runSessionTitleGeneration } from "./runSessionTitleGeneration";
import type { Session } from "./types";

export function startTranscriptTitleGeneration(
	session: Session,
	notify: () => void,
): void {
	if (session.commandType !== "claude") return;
	if (session.generatedTitle || session.titleGenerationStarted) return;
	if (session.initialPrompt?.trim()) return;

	const filePath = transcriptPath(session);
	if (!filePath) return;

	const firstMessage = extractFirstUserMessage(filePath);
	if (!firstMessage) return;

	daemonLog(
		`session ${session.id} deriving title from first transcript message`,
	);
	runSessionTitleGeneration(session, firstMessage, notify);
}

function transcriptPath(session: Session): string | undefined {
	if (session.transcriptPath) return session.transcriptPath;
	if (!session.cwd || !session.claudeSessionId) return undefined;
	return (
		findTranscriptPathSync(session.cwd, session.claudeSessionId) ?? undefined
	);
}
