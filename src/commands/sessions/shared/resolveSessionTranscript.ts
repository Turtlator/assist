import * as fs from "node:fs";
import * as path from "node:path";
import { readTranscriptHead } from "../summarise/readTranscriptHead";
import { readTranscriptTail } from "../summarise/readTranscriptTail";
import { claudeProjectsRoot } from "./claudeProjectsRoot";
import { extractSessionMeta } from "./extractSessionMeta";

type SessionTranscript = {
	path: string;
	prompt?: string;
	firstTimestamp?: string;
	lastTimestamp?: string;
};

export function resolveSessionTranscript(
	sessionId: string,
	projectsRoot: string = claudeProjectsRoot(),
): SessionTranscript | undefined {
	const filePath = findTranscriptFile(sessionId, projectsRoot);
	if (!filePath) return undefined;

	const meta = extractSessionMeta(splitLines(readTranscriptHead(filePath)));
	return {
		path: filePath,
		prompt: meta.name || undefined,
		firstTimestamp: meta.timestamp || undefined,
		lastTimestamp: lastTimestamp(splitLines(readTranscriptTail(filePath))),
	};
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

function splitLines(content: string | undefined): string[] {
	return content ? content.split("\n").filter(Boolean) : [];
}

function lastTimestamp(lines: string[]): string | undefined {
	for (const line of lines.reverse()) {
		const timestamp = timestampOf(line);
		if (timestamp) return timestamp;
	}
	return undefined;
}

function timestampOf(line: string): string | undefined {
	try {
		const entry = JSON.parse(line) as { timestamp?: unknown };
		return typeof entry.timestamp === "string" ? entry.timestamp : undefined;
	} catch {
		return undefined;
	}
}
