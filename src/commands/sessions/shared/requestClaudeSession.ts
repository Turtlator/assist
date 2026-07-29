import { requestSession } from "./requestSession";

export function requestClaudeSession(
	prompt: string,
	cwd?: string,
	options?: { inPlace?: boolean },
): Promise<string> {
	return requestSession({
		type: "create",
		prompt,
		cwd,
		inPlace: options?.inPlace === true,
	});
}
