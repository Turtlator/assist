import { existsSync } from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../../../shared/harnesses";

export function codexSessionsDir(): string {
	return path.join(harnesses.codex.homeDir, "sessions");
}

export function hasCodexSessions(): boolean {
	return existsSync(codexSessionsDir());
}
