import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readBodyArgument } from "./readBodyArgument";

const originalStdin = process.stdin;

function stubStdin(content: string): void {
	Object.defineProperty(process, "stdin", {
		value: Readable.from([Buffer.from(content, "utf8")]),
		configurable: true,
	});
}

afterEach(() => {
	Object.defineProperty(process, "stdin", {
		value: originalStdin,
		configurable: true,
	});
	vi.restoreAllMocks();
});

describe("readBodyArgument", () => {
	describe("when the value is not -", () => {
		it("should return it unchanged", async () => {
			expect(await readBodyArgument("a plain reason")).toBe("a plain reason");
		});

		it("should not treat a body that merely contains a dash as stdin", async () => {
			expect(await readBodyArgument("well - actually")).toBe("well - actually");
		});
	});

	describe("when the value is -", () => {
		it("should read the body from stdin verbatim", async () => {
			const body = "Renames `query_duckdb` to $(query_data) for $VAR";
			stubStdin(body);

			expect(await readBodyArgument("-")).toBe(body);
		});

		it("should preserve internal newlines and strip the trailing one", async () => {
			stubStdin("first line\n\nsecond `line`\n");

			expect(await readBodyArgument("-")).toBe("first line\n\nsecond `line`");
		});

		it("should exit when stdin is empty", async () => {
			stubStdin("   \n");
			const exit = vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("process.exit");
			});

			await expect(readBodyArgument("-")).rejects.toThrow("process.exit");
			expect(exit).toHaveBeenCalledWith(1);
		});
	});
});
