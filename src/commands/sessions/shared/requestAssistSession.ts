import { requestSession } from "./requestSession";

export function requestAssistSession(
	assistArgs: string[],
	cwd?: string,
	options?: { inPlace?: boolean; launchedFrom?: string },
): Promise<string> {
	return requestSession({
		type: "create-assist",
		assistArgs,
		cwd,
		inPlace: options?.inPlace === true,
		launchedFrom: options?.launchedFrom ?? process.env.ASSIST_SESSION_ID,
	});
}
