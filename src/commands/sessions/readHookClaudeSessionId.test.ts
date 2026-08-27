import { afterEach, describe, expect, it, vi } from "vitest";
import { readStdin } from "../../lib/readStdin";
import { readHookClaudeSessionId } from "./readHookClaudeSessionId";

vi.mock("../../lib/readStdin", () => ({ readStdin: vi.fn() }));

const readStdinMock = readStdin as unknown as ReturnType<typeof vi.fn>;

function setTty(isTTY: boolean): void {
	Object.defineProperty(process.stdin, "isTTY", {
		value: isTTY,
		configurable: true,
	});
}

describe("readHookClaudeSessionId", () => {
	afterEach(() => {
		vi.clearAllMocks();
		setTty(false);
	});

	it("reads the conversation id from the hook payload", async () => {
		setTty(false);
		readStdinMock.mockResolvedValue(
			JSON.stringify({
				session_id: "abc-123",
				hook_event_name: "UserPromptSubmit",
			}),
		);

		await expect(readHookClaudeSessionId()).resolves.toBe("abc-123");
	});

	it("returns nothing when the payload is not hook json", async () => {
		setTty(false);
		readStdinMock.mockResolvedValue("not json");

		await expect(readHookClaudeSessionId()).resolves.toBeUndefined();
	});

	it("never blocks on a terminal, where no hook payload is coming", async () => {
		setTty(true);

		await expect(readHookClaudeSessionId()).resolves.toBeUndefined();
		expect(readStdinMock).not.toHaveBeenCalled();
	});
});
