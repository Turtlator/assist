import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const root = join(tmpdir(), "assist-global-config-target-test");
const winHome = join(root, "win-home");

const platform = vi.hoisted(() => ({ value: "wsl" }));
const windowsHome = vi.hoisted(() => ({ path: null as string | null }));

vi.mock("../lib/detectPlatform", () => ({
	detectPlatform: () => platform.value,
}));

vi.mock("./windowsHomeFromWsl", () => ({
	windowsHomeFromWsl: () => windowsHome.path,
}));

import { globalConfigTargetFor } from "./globalConfigTargetFor";
import { getGlobalConfigPath } from "./loadConfigFrom";

mkdirSync(winHome, { recursive: true });

afterAll(() => {
	rmSync(root, { recursive: true, force: true });
});

describe("globalConfigTargetFor", () => {
	beforeEach(() => {
		platform.value = "wsl";
		windowsHome.path = winHome;
	});

	it("points a windows-host repo at the windows home's config", () => {
		expect(globalConfigTargetFor(String.raw`C:\git\nextgen`)).toEqual({
			ok: true,
			path: join(winHome, ".assist.yml"),
		});
	});

	it("points a posix repo at this host's own config", () => {
		expect(globalConfigTargetFor("/home/me/git/assist")).toEqual({
			ok: true,
			path: getGlobalConfigPath(),
		});
	});

	it("keeps a windows repo local when this host is windows itself", () => {
		platform.value = "windows";

		expect(globalConfigTargetFor(String.raw`C:\git\nextgen`)).toEqual({
			ok: true,
			path: getGlobalConfigPath(),
		});
	});

	it("fails when windowsProjectsRoot leaves the windows home unknown", () => {
		windowsHome.path = null;

		expect(globalConfigTargetFor(String.raw`C:\git\nextgen`)).toEqual({
			ok: false,
			error: expect.stringContaining("sessions.windowsProjectsRoot"),
		});
	});

	it("fails when the windows home is not mounted", () => {
		windowsHome.path = join(root, "absent");

		expect(globalConfigTargetFor(String.raw`C:\git\nextgen`)).toEqual({
			ok: false,
			error: expect.stringContaining(join(root, "absent")),
		});
	});
});
