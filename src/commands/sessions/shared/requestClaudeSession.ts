import { requestSession } from "./requestSession";

export function requestClaudeSession(
	prompt: string,
	cwd?: string,
): Promise<string> {
	return requestSession({ type: "create", prompt, cwd });
}
