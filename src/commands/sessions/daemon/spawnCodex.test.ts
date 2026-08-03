import { describe, expect, it, vi } from "vitest";
import { spawnCodex } from "./spawnCodex";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({
	spawnPty: vi.fn(() => ({ fake: "pty" })),
}));

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

describe("spawnCodex", () => {
	it("starts a fresh interactive session with a prompt", () => {
		spawnCodex({ prompt: "Do the thing", cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["codex", "Do the thing"],
			"/repo",
			"7",
		);
	});

	it("starts a bare idle session with no prompt", () => {
		spawnCodex({ cwd: "/repo", sessionId: "7" });

		expect(spawnPtyMock).toHaveBeenCalledWith(["codex"], "/repo", "7");
	});

	it("starts with no options", () => {
		spawnCodex();

		expect(spawnPtyMock).toHaveBeenCalledWith(["codex"], undefined, undefined);
	});
});
