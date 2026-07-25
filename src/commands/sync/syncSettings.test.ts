import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { autoConfirmHintCommand } from "./printAutoConfirmHint";
import { syncSettings } from "./syncSettings";

const mockPromptConfirm = vi.fn();

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

describe("syncSettings", () => {
	let claudeDir: string;
	let targetBase: string;
	let logs: string[];

	beforeEach(() => {
		mockPromptConfirm.mockReset();
		mockPromptConfirm.mockResolvedValue(true);
		logs = [];
		vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
			logs.push(args.join(" "));
		});
		claudeDir = mkdtempSync(join(tmpdir(), "assist-sync-source-"));
		targetBase = mkdtempSync(join(tmpdir(), "assist-sync-target-"));
	});

	afterEach(() => {
		rmSync(claudeDir, { recursive: true, force: true });
		rmSync(targetBase, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	function writeSource(settings: unknown): void {
		writeFileSync(join(claudeDir, "settings.json"), JSON.stringify(settings));
	}

	function writeTarget(settings: unknown): void {
		writeFileSync(join(targetBase, "settings.json"), JSON.stringify(settings));
	}

	function readTarget(): Record<string, unknown> {
		return JSON.parse(readFileSync(join(targetBase, "settings.json"), "utf8"));
	}

	it("preserves enabledPlugins present only in home settings", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			permissions: { allow: ["Bash"] },
			enabledPlugins: { "my-plugin": true },
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		const result = readTarget();
		expect(result.enabledPlugins).toEqual({ "my-plugin": true });
		expect(result.permissions).toEqual({ allow: ["Read"] });
	});

	it("preserves arbitrary marketplace keys absent from the repo source", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			extraKnownMarketplaces: { acme: { source: "acme/marketplace" } },
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget().extraKnownMarketplaces).toEqual({
			acme: { source: "acme/marketplace" },
		});
	});

	it("does not prompt when the only difference is preserved user keys", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			permissions: { allow: ["Read"] },
			enabledPlugins: { "my-plugin": true },
		});

		await syncSettings(claudeDir, targetBase);

		expect(readTarget().enabledPlugins).toEqual({ "my-plugin": true });
	});

	it("lets the repo source win for keys it defines", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({
			permissions: { allow: ["Bash"] },
			enabledPlugins: { "my-plugin": true },
		});

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget().permissions).toEqual({ allow: ["Read"] });
	});

	it("writes the source verbatim when no target exists", async () => {
		writeSource({ permissions: { allow: ["Read"] } });

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(readTarget()).toEqual({ permissions: { allow: ["Read"] } });
	});

	it("prints the sync.autoConfirm hint alongside the overwrite prompt", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({ permissions: { allow: ["Bash"] } });

		await syncSettings(claudeDir, targetBase);

		expect(mockPromptConfirm).toHaveBeenCalled();
		expect(logged()).toContain(autoConfirmHintCommand);
	});

	it("does not print the hint when overwriting without prompting", async () => {
		writeSource({ permissions: { allow: ["Read"] } });
		writeTarget({ permissions: { allow: ["Bash"] } });

		await syncSettings(claudeDir, targetBase, { yes: true });

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(logged()).not.toContain(autoConfirmHintCommand);
	});

	function logged(): string {
		return logs.join("\n");
	}
});
