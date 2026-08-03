import type { HarnessKind } from "../../../shared/harnesses";
import { sessionBase } from "./sessionBase";
import { spawnCodex } from "./spawnCodex";
import { spawnPi } from "./spawnPi";
import { startOrHoldPty } from "./startOrHoldPty";
import type { Session } from "./types";

type SpawnOpts = { prompt?: string; cwd?: string; sessionId?: string };

type NonClaudeHarness = Exclude<HarnessKind, "claude">;

const spawners: Record<
	NonClaudeHarness,
	(opts: SpawnOpts) => NonNullable<Session["pty"]>
> = {
	codex: spawnCodex,
	pi: spawnPi,
};

export function createHarnessSession(
	id: string,
	harness: NonClaudeHarness,
	prompt?: string,
	cwd?: string,
	holdPty?: boolean,
): Session {
	return {
		...sessionBase(id, prompt ? "running" : "waiting"),
		name: `Session ${id}`,
		commandType: "claude",
		harness,
		...startOrHoldPty(
			() => spawners[harness]({ prompt, cwd, sessionId: id }),
			holdPty,
		),
		cwd,
		initialPrompt: prompt,
	};
}
