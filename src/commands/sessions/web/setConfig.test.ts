import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";

const globalConfigPath = vi.hoisted(() => ({ path: "" }));

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../shared/loadConfigFrom", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getGlobalConfigPath: () => globalConfigPath.path };
});

import { tmpdir } from "node:os";
import { join } from "node:path";
import { setConfig } from "./setConfig";

const root = join(tmpdir(), "assist-set-config-test");
const paths = {
	root,
	repo: join(root, "repo"),
	repoConfig: join(root, "repo", "assist.yml"),
	globalConfig: join(root, "home", ".assist.yml"),
};
globalConfigPath.path = paths.globalConfig;

mkdirSync(paths.repo, { recursive: true });
mkdirSync(join(root, "home"), { recursive: true });

afterAll(() => {
	rmSync(paths.root, { recursive: true, force: true });
});

async function post(body: unknown): Promise<[number, Record<string, unknown>]> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	await setConfig(req, {} as ServerResponse);
	const [, status, payload] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Record<string, unknown>,
	];
	return [status, payload];
}

function readYaml(path: string): Record<string, unknown> {
	return parseYaml(readFileSync(path, "utf8")) as Record<string, unknown>;
}

describe("setConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		writeFileSync(paths.repoConfig, "commit:\n  push: false\n");
		writeFileSync(paths.globalConfig, "commit:\n  pull: false\n");
	});

	it("writes a scalar to the repo's assist.yml", async () => {
		const [status, payload] = await post({
			key: "commit.push",
			value: true,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("project");
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: true } });
		expect(readYaml(paths.globalConfig)).toEqual({ commit: { pull: false } });
	});

	it("writes a scalar to the global config when scope is global", async () => {
		const [status, payload] = await post({
			key: "backup.dir",
			value: "~/elsewhere",
			cwd: paths.repo,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("global");
		expect(readYaml(paths.globalConfig)).toEqual({
			commit: { pull: false },
			backup: { dir: "~/elsewhere" },
		});
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: false } });
	});

	it("coerces a string body value to the schema's number type", async () => {
		const [status] = await post({
			key: "sessions.windowsDaemonPort",
			value: "4310",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			sessions: { windowsDaemonPort: 4310 },
		});
	});

	it("rejects a value the schema refuses and leaves the file untouched", async () => {
		const [status, payload] = await post({
			key: "sessions.windowsVersionCheck",
			value: "sometimes",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.errors).toEqual([
			expect.stringContaining("sessions.windowsVersionCheck"),
		]);
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects a non-numeric value for a number key", async () => {
		const [status, payload] = await post({
			key: "sessions.windowsDaemonPort",
			value: "soon",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("expected a number");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects a complex leaf as read-only", async () => {
		const [status, payload] = await post({
			key: "sql.connections",
			value: "nope",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("read-only");
	});

	it("rejects an unknown key", async () => {
		const [status, payload] = await post({
			key: "bogus.key",
			value: "x",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("Unknown config key");
	});

	it("rejects a project write of a global-only key", async () => {
		const [status, payload] = await post({
			key: "sync.autoConfirm",
			value: true,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("global-only");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("accepts a global write of a global-only key", async () => {
		const [status, payload] = await post({
			key: "sync.autoConfirm",
			value: true,
			cwd: paths.repo,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("global");
		expect(readYaml(paths.globalConfig)).toEqual({
			commit: { pull: false },
			sync: { autoConfirm: true },
		});
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: false } });
	});

	it("rejects a missing cwd or scope", async () => {
		const [noCwd] = await post({ key: "commit.push", value: true });
		expect(noCwd).toBe(400);

		const [badScope] = await post({
			key: "commit.push",
			value: true,
			cwd: paths.repo,
			scope: "repo",
		});
		expect(badScope).toBe(400);
	});
});
