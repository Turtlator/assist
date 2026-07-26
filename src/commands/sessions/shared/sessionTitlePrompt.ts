import { isDraftCommand } from "./isDraftCommand";
import type { CommandType } from "./SessionInfoBase";

type TitlePromptSource = {
	commandType: CommandType;
	initialPrompt?: string;
	assistArgs?: string[];
};

export function sessionTitlePrompt(
	session: TitlePromptSource,
): string | undefined {
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
