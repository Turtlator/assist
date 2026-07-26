import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { isDraftCommand } from "./isDraftCommand";
import type { Session } from "./types";

export function startSessionTitleGeneration(
	session: Session | undefined,
	notify: () => void,
): void {
	if (!session || session.generatedTitle) return;
	const prompt = titlePrompt(session);
	if (!prompt) return;
	void generateSessionTitle(prompt)
		.then((title) => {
			if (!title) {
				daemonLog(`session ${session.id} title generation failed`);
				return;
			}
			session.generatedTitle = title;
			daemonLog(`session ${session.id} generated title: ${title}`);
			notify();
		})
		.catch((error) => {
			daemonLog(`session ${session.id} title generation errored: ${error}`);
		});
}

function titlePrompt(session: Session): string | undefined {
	if (session.commandType === "claude")
		return session.initialPrompt?.trim() || undefined;
	if (session.commandType !== "assist") return undefined;
	if (!isDraftCommand(session.assistArgs?.[0])) return undefined;
	return assistPromptArg(session.assistArgs);
}

function assistPromptArg(args?: string[]): string | undefined {
	const rest = args?.slice(1).filter((a) => !a.startsWith("--"));
	const text = rest?.[rest.length - 1]?.trim();
	if (!text || isBacklogItemId(text)) return undefined;
	return text;
}

function isBacklogItemId(text: string): boolean {
	return /^\d+$/.test(text);
}
