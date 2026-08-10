import * as fs from "node:fs";
import * as path from "node:path";
import { claudeProjectsRoot, projectSlug } from "./claudeProjectsRoot";

const SESSION_ID_ENV = "CLAUDE_CODE_SESSION_ID";

type Options = {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	projectsRoot?: string;
};

export function resolveCurrentSessionId(
	options: Options = {},
): string | undefined {
	const fromEnv = (options.env ?? process.env)[SESSION_ID_ENV];
	if (fromEnv) return fromEnv;

	const dir = path.join(
		options.projectsRoot ?? claudeProjectsRoot(),
		projectSlug(options.cwd ?? process.cwd()),
	);
	return newestTranscriptId(dir);
}

function newestTranscriptId(dir: string): string | undefined {
	let entries: string[];
	try {
		entries = fs.readdirSync(dir);
	} catch {
		return undefined;
	}

	let newest: { id: string; modifiedAt: number } | undefined;
	for (const entry of entries) {
		if (!entry.endsWith(".jsonl")) continue;
		const modifiedAt = modifiedAtOf(path.join(dir, entry));
		if (modifiedAt === undefined) continue;
		if (!newest || modifiedAt > newest.modifiedAt)
			newest = { id: path.basename(entry, ".jsonl"), modifiedAt };
	}
	return newest?.id;
}

function modifiedAtOf(filePath: string): number | undefined {
	try {
		return fs.statSync(filePath).mtimeMs;
	} catch {
		return undefined;
	}
}
