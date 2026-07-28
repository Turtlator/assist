import { describe, expect, it } from "vitest";
import { restartAdvice } from "./restartAdvice";

describe("restartAdvice", () => {
	it("asks for a web server restart and a hard reload when web UI changed", () => {
		expect(
			restartAdvice(["src/commands/sessions/web/ui/App.tsx", "README.md"]),
		).toEqual(["restart the web server, then hard-reload the browser tab"]);
	});

	it("asks for a daemon restart when daemon-reached code changed", () => {
		expect(
			restartAdvice(["src/commands/sessions/daemon/lifecycleHandlers.ts"]),
		).toEqual(["restart the daemon"]);
	});

	it("lists both when both changed", () => {
		expect(
			restartAdvice([
				"src/commands/sessions/web/ui/SessionList.tsx",
				"src/commands/sessions/parseSessionFile.ts",
			]),
		).toEqual([
			"restart the web server, then hard-reload the browser tab",
			"restart the daemon",
		]);
	});

	it("does not ask for a daemon restart when only web UI changed", () => {
		expect(
			restartAdvice(["src/commands/sessions/web/ui/nested/Chip.tsx"]),
		).not.toContain("restart the daemon");
	});

	it("asks for nothing when unrelated paths changed", () => {
		expect(
			restartAdvice(["README.md", "src/commands/watch/watchWait.ts"]),
		).toEqual([]);
	});

	it("asks for nothing when nothing changed", () => {
		expect(restartAdvice([])).toEqual([]);
	});
});
