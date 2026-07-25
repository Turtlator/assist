import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { PersistedSession } from "./loadPersistedSessions";

export function hasTranscriptOnDisk(persisted: PersistedSession): boolean {
	return (
		!!persisted.claudeSessionId &&
		!!findTranscriptPathSync(persisted.cwd, persisted.claudeSessionId)
	);
}
