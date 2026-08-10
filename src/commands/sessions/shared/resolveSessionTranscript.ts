import * as fs from "node:fs";
import * as path from "node:path";
import { readTranscriptHead } from "../summarise/readTranscriptHead";
import { claudeProjectsRoot } from "./claudeProjectsRoot";
import { extractSessionMeta } from "./extractSessionMeta";

const MAX_PROMPT_LENGTH = 80;

type SessionTranscript = {
	path: string;
	prompt?: string;
};

export function resolveSessionTranscript(
	sessionId: string,
	projectsRoot: string = claudeProjectsRoot(),
): SessionTranscript | undefined {
	const filePath = findTranscriptFile(sessionId, projectsRoot);
	if (!filePath) return undefined;

	const head = readTranscriptHead(filePath);
	const meta = extractSessionMeta(head ? head.split("\n").filter(Boolean) : []);
	return { path: filePath, prompt: promptOf(meta) };
}

function findTranscriptFile(
	sessionId: string,
	projectsRoot: string,
): string | undefined {
	let projectDirs: string[];
	try {
		projectDirs = fs.readdirSync(projectsRoot);
	} catch {
		return undefined;
	}
	for (const dir of projectDirs) {
		const candidate = path.join(projectsRoot, dir, `${sessionId}.jsonl`);
		if (fs.existsSync(candidate)) return candidate;
	}
	return undefined;
}

function promptOf(meta: {
	name: string;
	commandName: string;
	commandArgs: string;
}): string | undefined {
	if (meta.name) return meta.name;
	if (!meta.commandName) return undefined;
	const command = `/${meta.commandName}`;
	const rendered = meta.commandArgs
		? `${command} ${meta.commandArgs}`
		: command;
	return rendered.slice(0, MAX_PROMPT_LENGTH);
}
