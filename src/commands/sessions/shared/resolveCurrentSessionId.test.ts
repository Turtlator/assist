import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveCurrentSessionId } from "./resolveCurrentSessionId";

const CWD = "/home/dev/assist";
const SLUG = "-home-dev-assist";
const NEWER = "991a1fde-669f-43f0-9b30-60892465b411";
const OLDER = "7c8a778a-19ae-4dd9-abcc-e589a2e352ff";

let projectsRoot: string;

function writeTranscript(name: string, modifiedAtSeconds: number): void {
	const filePath = join(projectsRoot, SLUG, name);
	writeFileSync(filePath, "{}\n");
	utimesSync(filePath, modifiedAtSeconds, modifiedAtSeconds);
}

function resolve(env: NodeJS.ProcessEnv = {}) {
	return resolveCurrentSessionId({ cwd: CWD, env, projectsRoot });
}

describe("resolveCurrentSessionId", () => {
	beforeEach(() => {
		projectsRoot = mkdtempSync(join(tmpdir(), "current-session-"));
		mkdirSync(join(projectsRoot, SLUG), { recursive: true });
	});

	afterEach(() => {
		rmSync(projectsRoot, { recursive: true, force: true });
	});

	it("prefers the session id Claude Code exports over the newest transcript", () => {
		writeTranscript(`${NEWER}.jsonl`, 2_000);

		expect(resolve({ CLAUDE_CODE_SESSION_ID: OLDER })).toBe(OLDER);
	});

	it("falls back to the newest transcript in the current directory's project slug", () => {
		writeTranscript(`${OLDER}.jsonl`, 1_000);
		writeTranscript(`${NEWER}.jsonl`, 2_000);

		expect(resolve()).toBe(NEWER);
	});

	it("ignores transcripts under other project slugs", () => {
		const otherDir = join(projectsRoot, "-home-dev-other-repo");
		mkdirSync(otherDir, { recursive: true });
		const other = join(otherDir, `${NEWER}.jsonl`);
		writeFileSync(other, "{}\n");
		utimesSync(other, 3_000, 3_000);
		writeTranscript(`${OLDER}.jsonl`, 1_000);

		expect(resolve()).toBe(OLDER);
	});

	it("ignores files that are not transcripts", () => {
		writeTranscript("notes.txt", 3_000);
		writeTranscript(`${OLDER}.jsonl`, 1_000);

		expect(resolve()).toBe(OLDER);
	});

	it("returns undefined when the project directory holds no transcripts", () => {
		expect(resolve()).toBeUndefined();
	});

	it("returns undefined when the project directory does not exist", () => {
		expect(
			resolveCurrentSessionId({
				cwd: "/home/dev/unknown",
				env: {},
				projectsRoot,
			}),
		).toBeUndefined();
	});
});
