import { existsSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { detectPlatform } from "../../../lib/detectPlatform";
import { repoDirExists } from "./repoDirExists";

vi.mock("node:fs", () => ({ existsSync: vi.fn() }));
vi.mock("../../../lib/detectPlatform", () => ({ detectPlatform: vi.fn() }));

const exists = vi.mocked(existsSync);
const platform = vi.mocked(detectPlatform);

describe("repoDirExists", () => {
	beforeEach(() => {
		exists.mockReset();
		platform.mockReturnValue("wsl");
	});

	it("reports a directory that exists", () => {
		exists.mockReturnValue(true);

		expect(repoDirExists("/git/repo")).toBe(true);
		expect(exists).toHaveBeenCalledWith("/git/repo");
	});

	it("reports a directory that no longer exists", () => {
		exists.mockReturnValue(false);

		expect(repoDirExists("/git/repo-2")).toBe(false);
	});

	it("checks a Windows clone through its /mnt mount under WSL", () => {
		exists.mockReturnValue(true);
		repoDirExists(String.raw`C:\git\repo`);

		expect(exists).toHaveBeenCalledWith("/mnt/c/git/repo");
	});
});
