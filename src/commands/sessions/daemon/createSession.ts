import { randomUUID } from "node:crypto";
import type { HarnessKind } from "../../../shared/harnesses";
import { type ServerRunMeta, serverRunMeta } from "./serverRunMeta";
import { spawnClaude } from "./spawnClaude";
import { spawnPi } from "./spawnPi";
import { spawnRun } from "./spawnRun";
import { startOrHoldPty } from "./startOrHoldPty";
import type { Session } from "./types";
import { sessionBase } from "./sessionBase";

export type { Session, SessionInfo, SessionStatus } from "./types";

export function createSession(
	id: string,
	prompt?: string,
	cwd?: string,
	design?: boolean,
	harness?: HarnessKind,
	holdPty?: boolean,
): Session {
	if (harness === "pi") return createPiSession(id, prompt, cwd, holdPty);
	/* why: assign the claude conversation id up front so the card binds to the
	 * transcript this process writes, not the newest unclaimed .jsonl in the cwd
	 * (which races concurrent sessions in the same repo) (#413). */
	const claudeSessionId = randomUUID();
	/* why: a session with no initial prompt opens idle, awaiting the user's first
	 * input — no Claude Code hook fires until they submit, so it must start
	 * waiting rather than the default running, which would otherwise stick until
	 * the first turn's Stop (#449). A prompted session is working immediately. */
	return {
		...sessionBase(id, prompt ? "running" : "waiting"),
		name: prompt?.slice(0, 40) || `Session ${id}`,
		commandType: "claude",
		...startOrHoldPty(
			() =>
				spawnClaude({ prompt, cwd, sessionId: id, claudeSessionId, design }),
			holdPty,
		),
		cwd,
		claudeSessionId,
		initialPrompt: prompt,
		design,
	};
}

function createPiSession(
	id: string,
	prompt?: string,
	cwd?: string,
	holdPty?: boolean,
): Session {
	return {
		...sessionBase(id, prompt ? "running" : "waiting"),
		name: prompt?.slice(0, 40) || `Session ${id}`,
		commandType: "claude",
		harness: "pi",
		...startOrHoldPty(() => spawnPi({ prompt, cwd, sessionId: id }), holdPty),
		cwd,
		initialPrompt: prompt,
	};
}

export function createRunSession(
	id: string,
	runName: string,
	runArgs: string[],
	cwd?: string,
	meta: ServerRunMeta = serverRunMeta(runName, cwd),
): Session {
	return {
		...sessionBase(id, "running"),
		name: `run: ${runName}`,
		commandType: "run",
		pty: spawnRun({ name: runName, args: runArgs, cwd }),
		runName,
		runArgs,
		cwd,
		server: meta.server || undefined,
		serverPort: meta.port,
		serverOrigin: meta.origin,
	};
}
