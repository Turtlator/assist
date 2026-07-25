import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readProposedItem } from "./readProposedItem";

const payload = {
	name: "Preview blocks on approval",
	type: "bug",
	description: "**Repro:**\n\n1. Do a thing",
	acceptanceCriteria: ["It blocks"],
};

function writePayload(content: unknown): string {
	const dir = mkdtempSync(join(tmpdir(), "assist-propose-"));
	const file = join(dir, "item.json");
	writeFileSync(
		file,
		typeof content === "string" ? content : JSON.stringify(content),
	);
	return file;
}

afterEach(() => {
	vi.restoreAllMocks();
});

function expectFailure() {
	const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
	return errorSpy;
}

describe("readProposedItem", () => {
	it("reads and validates a payload from a file", async () => {
		expect(await readProposedItem(writePayload(payload))).toEqual(payload);
	});

	it("reads a payload from stdin", async () => {
		vi.spyOn(process, "stdin", "get").mockReturnValue(
			Readable.from([JSON.stringify(payload)]) as typeof process.stdin,
		);

		expect(await readProposedItem("-")).toEqual(payload);
	});

	it("defaults acceptance criteria to an empty list", async () => {
		const item = await readProposedItem(
			writePayload({ name: "n", type: "story" }),
		);

		expect(item.acceptanceCriteria).toEqual([]);
	});

	it("exits non-zero when the payload is not valid JSON", async () => {
		const errorSpy = expectFailure();

		await expect(readProposedItem(writePayload("{ nope"))).rejects.toThrow(
			"process.exit",
		);
		expect(errorSpy.mock.calls.join("\n")).toContain("not valid JSON");
	});

	it("exits non-zero and names the offending field on a schema failure", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(writePayload({ name: "n", type: "epic" })),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("type");
	});

	it("exits non-zero on an unknown field", async () => {
		const errorSpy = expectFailure();

		await expect(
			readProposedItem(writePayload({ name: "n", type: "story", plan: [] })),
		).rejects.toThrow("process.exit");
		expect(errorSpy.mock.calls.join("\n")).toContain("plan");
	});

	it("exits non-zero when the file cannot be read", async () => {
		const errorSpy = expectFailure();

		await expect(readProposedItem("/no/such/payload.json")).rejects.toThrow(
			"process.exit",
		);
		expect(errorSpy.mock.calls.join("\n")).toContain("Cannot read the payload");
	});
});
