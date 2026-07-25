import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { autoConfirmHintCommand } from "./printAutoConfirmHint";
import { syncClaudeMd } from "./syncClaudeMd";

const mockPromptConfirm = vi.fn();

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

describe("syncClaudeMd", () => {
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
		claudeDir = mkdtempSync(join(tmpdir(), "assist-claudemd-source-"));
		targetBase = mkdtempSync(join(tmpdir(), "assist-claudemd-target-"));
	});

	afterEach(() => {
		rmSync(claudeDir, { recursive: true, force: true });
		rmSync(targetBase, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	function writeSource(content: string): void {
		writeFileSync(join(claudeDir, "CLAUDE.md"), content);
	}

	function writeTarget(content: string): void {
		writeFileSync(join(targetBase, "CLAUDE.md"), content);
	}

	function readTarget(): string {
		return readFileSync(join(targetBase, "CLAUDE.md"), "utf8");
	}

	function logged(): string {
		return logs.join("\n");
	}

	it("prints the sync.autoConfirm hint alongside the overwrite prompt", async () => {
		writeSource("new");
		writeTarget("old");

		await syncClaudeMd(claudeDir, targetBase);

		expect(mockPromptConfirm).toHaveBeenCalled();
		expect(logged()).toContain(autoConfirmHintCommand);
		expect(readTarget()).toBe("new");
	});

	it("does not print the hint when overwriting without prompting", async () => {
		writeSource("new");
		writeTarget("old");

		await syncClaudeMd(claudeDir, targetBase, { yes: true });

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(logged()).not.toContain(autoConfirmHintCommand);
		expect(readTarget()).toBe("new");
	});

	it("skips the copy when the prompt is declined", async () => {
		mockPromptConfirm.mockResolvedValue(false);
		writeSource("new");
		writeTarget("old");

		await syncClaudeMd(claudeDir, targetBase);

		expect(readTarget()).toBe("old");
	});

	it("copies without prompting when the target is missing", async () => {
		writeSource("new");

		await syncClaudeMd(claudeDir, targetBase);

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(readTarget()).toBe("new");
	});
});
