import { requestSession } from "./requestSession";

export function requestAssistSession(
	assistArgs: string[],
	cwd?: string,
): Promise<string> {
	return requestSession({ type: "create-assist", assistArgs, cwd });
}
