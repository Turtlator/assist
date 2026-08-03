import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	cwd?: string;
	sessionId?: string;
};

export function spawnCodex(opts: SpawnOpts = {}) {
	const args = ["codex"];
	if (opts.prompt) args.push(opts.prompt);
	return spawnPty(args, opts.cwd, opts.sessionId);
}
