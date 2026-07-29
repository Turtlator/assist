import { requestSession } from "./requestSession";

export function requestAssistSession(
	assistArgs: string[],
	cwd?: string,
	options?: { inPlace?: boolean },
): Promise<string> {
	return requestSession({
		type: "create-assist",
		assistArgs,
		cwd,
		inPlace: options?.inPlace === true,
	});
}
