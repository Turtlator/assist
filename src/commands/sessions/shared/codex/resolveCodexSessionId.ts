import * as fs from "node:fs";
import { codexRolloutMeta } from "./codexRolloutMeta";
import { discoverCodexRolloutPaths } from "./discoverCodexRolloutPaths";
import { readCodexHeadLines } from "./readCodexHeadLines";

const META_LINES = 5;

export async function resolveCodexSessionId(
	cwd: string,
	sinceMs: number,
): Promise<string | null> {
	if (!cwd) return null;
	const paths = await discoverCodexRolloutPaths();
	const touched = await Promise.all(
		paths.map((file) => touchedSince(file, sinceMs)),
	);
	const candidates = await Promise.all(
		paths
			.filter((_, index) => touched[index])
			.map((file) => startedIn(file, cwd, sinceMs)),
	);
	return newestSessionId(candidates);
}

type Candidate = { sessionId: string; startedAt: number } | null;

function newestSessionId(candidates: Candidate[]): string | null {
	let best: Exclude<Candidate, null> | null = null;
	for (const candidate of candidates)
		if (candidate && (!best || candidate.startedAt > best.startedAt))
			best = candidate;
	return best?.sessionId ?? null;
}

async function startedIn(
	file: string,
	cwd: string,
	sinceMs: number,
): Promise<Candidate> {
	const meta = codexRolloutMeta(await readCodexHeadLines(file, META_LINES));
	if (!meta.sessionId || meta.cwd !== cwd) return null;
	const startedAt = Date.parse(meta.timestamp);
	if (!Number.isFinite(startedAt) || startedAt < sinceMs) return null;
	return { sessionId: meta.sessionId, startedAt };
}

async function touchedSince(file: string, sinceMs: number): Promise<boolean> {
	try {
		return (await fs.promises.stat(file)).mtimeMs >= sinceMs;
	} catch {
		return false;
	}
}
