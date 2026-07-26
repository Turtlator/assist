import { sessionTitlePrompt } from "../shared/sessionTitlePrompt";
import { runSessionTitleGeneration } from "./runSessionTitleGeneration";
import type { Session } from "./types";

export function startSessionTitleGeneration(
	session: Session | undefined,
	notify: () => void,
): void {
	if (!session || session.generatedTitle || session.titleGenerationStarted)
		return;
	const prompt = sessionTitlePrompt(session);
	if (!prompt) return;
	runSessionTitleGeneration(session, prompt, notify);
}
