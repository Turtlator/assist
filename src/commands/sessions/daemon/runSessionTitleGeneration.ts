import { daemonLog } from "./daemonLog";
import {
	generateSessionTitle,
	SESSION_TITLE_MAX_LENGTH,
} from "./generateSessionTitle";
import type { Session } from "./types";

export function runSessionTitleGeneration(
	session: Session,
	prompt: string,
	notify: () => void,
): void {
	if (session.generatedTitle || session.titleGenerationStarted) return;
	session.titleGenerationStarted = true;
	void generateSessionTitle(prompt)
		.then((generated) => {
			session.generatedTitle = generated ?? singleLine(prompt);
			daemonLog(
				generated
					? `session ${session.id} generated title: ${generated}`
					: `session ${session.id} title generation failed; falling back to "${session.generatedTitle}"`,
			);
			notify();
		})
		.catch((error) => {
			daemonLog(`session ${session.id} title generation errored: ${error}`);
		});
}

function singleLine(prompt: string): string {
	return prompt.replace(/\s+/g, " ").trim().slice(0, SESSION_TITLE_MAX_LENGTH);
}
