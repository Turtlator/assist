import { describe, expect, it, vi } from "vitest";
import { createHarnessSession } from "./createHarnessSession";
import { spawnCodex } from "./spawnCodex";
import { spawnPi } from "./spawnPi";

vi.mock("./spawnCodex", () => ({ spawnCodex: vi.fn(() => ({ id: "codex" })) }));
vi.mock("./spawnPi", () => ({ spawnPi: vi.fn(() => ({ id: "pi" })) }));

const spawnCodexMock = spawnCodex as unknown as ReturnType<typeof vi.fn>;
const spawnPiMock = spawnPi as unknown as ReturnType<typeof vi.fn>;

describe("createHarnessSession", () => {
	it("spawns codex for a codex session and records the harness", () => {
		const session = createHarnessSession("3", "codex", "go", "/repo");

		expect(session.harness).toBe("codex");
		expect(session.commandType).toBe("claude");
		expect(session.status).toBe("running");
		expect(session.initialPrompt).toBe("go");
		expect(spawnCodexMock).toHaveBeenCalledWith({
			prompt: "go",
			cwd: "/repo",
			sessionId: "3",
		});
	});

	it("spawns pi for a pi session", () => {
		const session = createHarnessSession("4", "pi", "go", "/repo");

		expect(session.harness).toBe("pi");
		expect(spawnPiMock).toHaveBeenCalledWith({
			prompt: "go",
			cwd: "/repo",
			sessionId: "4",
		});
	});

	it("opens an unprompted session waiting for the first input", () => {
		const session = createHarnessSession("5", "codex", undefined, "/repo");

		expect(session.status).toBe("waiting");
	});

	it("holds the pty when asked, deferring the spawn", () => {
		const session = createHarnessSession("6", "codex", "go", "/repo", true);

		expect(session.pty).toBeNull();
		expect(session.pendingStart).toBeTypeOf("function");
		expect(spawnCodexMock).not.toHaveBeenCalledWith({
			prompt: "go",
			cwd: "/repo",
			sessionId: "6",
		});
	});
});
