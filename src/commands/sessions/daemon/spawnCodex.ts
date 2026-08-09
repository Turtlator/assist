import { spawnPty } from "./spawnPty";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
	sessionId?: string;
};

export function spawnCodex(opts: SpawnOpts = {}) {
	return spawnPty(codexArgs(opts), opts.cwd, opts.sessionId);
}

function codexArgs(opts: SpawnOpts): string[] {
	if (opts.resumeSessionId) {
		const base = ["codex", "resume", opts.resumeSessionId];
		return opts.prompt ? [...base, opts.prompt] : base;
	}
	return opts.prompt ? ["codex", opts.prompt] : ["codex"];
}
