import { isReferenceOnlyPrompt } from "../shared/isReferenceOnlyPrompt";
import { sessionTitlePrompt } from "../shared/sessionTitlePrompt";
import { daemonLog } from "./daemonLog";
import { runSessionTitleGeneration } from "./runSessionTitleGeneration";
import { singleLineTitle } from "./singleLineTitle";
import type { Session } from "./types";

export function startSessionTitleGeneration(
	session: Session | undefined,
	notify: () => void,
): void {
	if (!session || session.generatedTitle || session.titleGenerationStarted)
		return;
	const prompt = sessionTitlePrompt(session);
	if (!prompt) return;
	if (isReferenceOnlyPrompt(prompt)) {
		daemonLog(
			`session ${session.id} title deferred: prompt is a reference only (${prompt})`,
		);
		return;
	}
	runSessionTitleGeneration(session, prompt, notify, singleLineTitle(prompt));
}
