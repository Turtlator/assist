import { acceptsResumeSession } from "../../../shared/acceptsResumeSession";

export function assistResumeArgs(session: {
	assistArgs: string[];
	claudeSessionId?: string;
}): string[] {
	const args = ["assist", ...session.assistArgs];
	return session.claudeSessionId && acceptsResumeSession(session.assistArgs)
		? [...args, "--resume-session", session.claudeSessionId]
		: args;
}
