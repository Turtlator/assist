import { describe, expect, it } from "vitest";

import { exitOutputTail } from "./exitOutputTail";

const ESC = String.fromCharCode(27);

describe("exitOutputTail", () => {
	it("returns the last lines of output", () => {
		expect(exitOutputTail("one\r\ntwo\r\nerror: unknown option\r\n")).toBe(
			"one | two | error: unknown option",
		);
	});

	it("strips ansi escapes", () => {
		expect(exitOutputTail(`${ESC}[31merror: boom${ESC}[0m\r\n`)).toBe(
			"error: boom",
		);
	});

	it("keeps only the trailing lines", () => {
		const scrollback = Array.from({ length: 9 }, (_, i) => `line ${i}`).join(
			"\n",
		);

		expect(exitOutputTail(scrollback)).toBe(
			"line 4 | line 5 | line 6 | line 7 | line 8",
		);
	});

	it("reports nothing when the process produced no output", () => {
		expect(exitOutputTail("\r\n  \r\n")).toBeUndefined();
	});
});
