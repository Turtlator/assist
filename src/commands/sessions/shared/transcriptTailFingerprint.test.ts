import { describe, expect, it } from "vitest";
import { transcriptTailFingerprint } from "./transcriptTailFingerprint";

describe("transcriptTailFingerprint", () => {
	it("returns the uuid of the last conversational entry", () => {
		expect(
			transcriptTailFingerprint([
				{ type: "user", uuid: "a" },
				{ type: "assistant", uuid: "b" },
			]),
		).toBe("b");
	});

	it("ignores bookkeeping records appended after the last message", () => {
		expect(
			transcriptTailFingerprint([
				{ type: "assistant", uuid: "b" },
				{ type: "last-prompt" },
				{ type: "mode" },
				{ type: "permission-mode" },
				{ type: "file-history-snapshot" },
			]),
		).toBe("b");
	});

	it("ignores sidechain and meta entries", () => {
		expect(
			transcriptTailFingerprint([
				{ type: "assistant", uuid: "b" },
				{ type: "user", uuid: "sub", isSidechain: true },
				{ type: "user", uuid: "meta", isMeta: true },
			]),
		).toBe("b");
	});

	it("returns null when there is nothing conversational to fingerprint", () => {
		expect(transcriptTailFingerprint([])).toBeNull();
		expect(transcriptTailFingerprint([{ type: "mode" }])).toBeNull();
	});

	it("returns null when the last conversational entry carries no uuid", () => {
		expect(transcriptTailFingerprint([{ type: "assistant" }])).toBeNull();
	});
});
