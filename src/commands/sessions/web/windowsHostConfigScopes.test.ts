import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";

const root = join(tmpdir(), "assist-windows-host-config-test");
const wslHome = join(root, "wsl-home");
const winHome = join(root, "win-home");
const repo = join(root, "nextgen");
const wslGlobalConfig = join(wslHome, ".assist.yml");
const winGlobalConfig = join(winHome, ".assist.yml");
const windowsCwd = String.raw`C:\git\nextgen`;

const mockRespondJson = vi.fn();
const windowsHome = vi.hoisted(() => ({ path: null as string | null }));

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../shared/windowsHomeFromWsl", () => ({
	windowsHomeFromWsl: () => windowsHome.path,
}));

vi.mock("../../../lib/detectPlatform", () => ({
	detectPlatform: () => "wsl",
}));

vi.mock("./windowsCwdToWslPath", () => ({
	windowsCwdToWslPath: (cwd: string) =>
		cwd === String.raw`C:\git\nextgen`
			? join(tmpdir(), "assist-windows-host-config-test", "nextgen")
			: cwd,
}));

vi.mock("../../../shared/loadConfigFrom", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		getGlobalConfigPath: () =>
			join(
				tmpdir(),
				"assist-windows-host-config-test",
				"wsl-home",
				".assist.yml",
			),
	};
});

import type { ConfigEntry } from "../../config/readConfigEntries";
import { getConfig } from "./getConfig";
import { setConfig } from "./setConfig";
import { unsetConfig } from "./unsetConfig";

mkdirSync(repo, { recursive: true });
mkdirSync(wslHome, { recursive: true });
mkdirSync(winHome, { recursive: true });

afterAll(() => {
	vi.unstubAllEnvs();
	rmSync(root, { recursive: true, force: true });
});

type Response = [number, Record<string, unknown>];

async function post(
	handler: typeof setConfig,
	body: unknown,
): Promise<Response> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	await handler(req, {} as ServerResponse);
	const [, status, payload] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Record<string, unknown>,
	];
	return [status, payload];
}

function get(cwd: string): [number, ConfigEntry[]] {
	const req = { url: `/api/config?cwd=${encodeURIComponent(cwd)}` };
	getConfig(req as IncomingMessage, {} as ServerResponse);
	const [, status, payload] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		ConfigEntry[],
	];
	return [status, payload];
}

function readYaml(path: string): Record<string, unknown> {
	return parseYaml(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function entryFor(entries: ConfigEntry[], key: string): ConfigEntry {
	const entry = entries.find((candidate) => candidate.key === key);
	if (!entry) throw new Error(`no entry for ${key}`);
	return entry;
}

describe("config scopes for a windows-host repo", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("HOME", wslHome);
		windowsHome.path = winHome;
		writeFileSync(wslGlobalConfig, "backup:\n  dir: ~/wsl-side\n");
		writeFileSync(winGlobalConfig, "backup:\n  dir: ~/windows-side\n");
		writeFileSync(join(repo, "assist.yml"), "commit:\n  push: false\n");
	});

	it("writes a repo-scoped key to the windows home's global config", async () => {
		const [status, payload] = await post(setConfig, {
			key: "worktree.enabled",
			value: true,
			cwd: windowsCwd,
			scope: "repo",
		});

		expect([status, payload]).toEqual([
			200,
			{ target: "repo", repoKey: "nextgen" },
		]);
		expect(readYaml(winGlobalConfig)).toEqual({
			backup: { dir: "~/windows-side" },
			repos: { nextgen: { worktree: { enabled: true } } },
		});
		expect(readYaml(wslGlobalConfig).repos).toBeUndefined();
	});

	it("writes a global-scoped key to the windows home's global config", async () => {
		const [status] = await post(setConfig, {
			key: "backup.dir",
			value: "~/elsewhere",
			cwd: windowsCwd,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(readYaml(winGlobalConfig)).toEqual({
			backup: { dir: "~/elsewhere" },
		});
		expect(readYaml(wslGlobalConfig).backup).toEqual({ dir: "~/wsl-side" });
	});

	it("removes a repo-scoped key from the windows home's global config", async () => {
		writeFileSync(
			winGlobalConfig,
			"repos:\n  nextgen:\n    worktree:\n      enabled: true\n      trunk: true\n",
		);

		const [status, payload] = await post(unsetConfig, {
			key: "worktree.enabled",
			cwd: windowsCwd,
			scope: "repo",
		});

		expect([status, payload.removed]).toEqual([200, true]);
		expect(readYaml(winGlobalConfig)).toEqual({
			repos: { nextgen: { worktree: { trunk: true } } },
		});
	});

	it("removes a global-scoped key from the windows home's global config", async () => {
		const [status, payload] = await post(unsetConfig, {
			key: "backup.dir",
			cwd: windowsCwd,
			scope: "global",
		});

		expect([status, payload.removed]).toEqual([200, true]);
		expect(readYaml(winGlobalConfig)).toEqual({});
		expect(readYaml(wslGlobalConfig).backup).toEqual({ dir: "~/wsl-side" });
	});

	it("reports the effective config merged from the windows home", () => {
		const [status, entries] = get(windowsCwd);

		expect(status).toBe(200);
		expect(entryFor(entries, "backup.dir")).toMatchObject({
			value: "~/windows-side",
			source: "global",
			globalConfigFile: winGlobalConfig,
		});
	});

	it("fails the save instead of falling back to the wsl home when the windows home is unknown", async () => {
		windowsHome.path = null;

		const [status, payload] = await post(setConfig, {
			key: "backup.dir",
			value: "~/elsewhere",
			cwd: windowsCwd,
			scope: "global",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("sessions.windowsProjectsRoot");
		expect(readYaml(wslGlobalConfig)).toEqual({
			backup: { dir: "~/wsl-side" },
		});
	});

	it("fails the read when the windows home is not reachable", () => {
		windowsHome.path = "/mnt/z/Users/absent";

		const [status, payload] = get(windowsCwd);

		expect(status).toBe(500);
		expect(String((payload as unknown as { error: string }).error)).toContain(
			"/mnt/z/Users/absent",
		);
	});
});
