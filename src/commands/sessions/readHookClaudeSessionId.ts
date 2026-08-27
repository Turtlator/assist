import { readStdin } from "../../lib/readStdin";

type HookInput = { session_id?: string };

/**
 * Claude Code pipes the hook payload — which names the conversation the hook
 * fired for — to every hook process. Reading it is how a session that has run
 * /clear reports its new conversation id: the id assigned at spawn time is
 * abandoned there, and nothing else tells the daemon.
 */
export async function readHookClaudeSessionId(): Promise<string | undefined> {
	if (process.stdin.isTTY) return undefined;
	try {
		const data: HookInput = JSON.parse(await readStdin());
		return data.session_id;
	} catch {
		return undefined;
	}
}
