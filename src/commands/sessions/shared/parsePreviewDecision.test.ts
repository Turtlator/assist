import { describe, expect, it } from "vitest";
import { parsePreviewDecision } from "./parsePreviewDecision";

const line = (msg: object) => JSON.stringify(msg);

const decision = (extra: object = {}) =>
	line({
		type: "pr-decision",
		requestId: "r1",
		decision: "approve",
		...extra,
	});

function parsed(extra: object = {}) {
	const incoming = parsePreviewDecision(decision(extra), "r1");
	if (incoming?.kind !== "decision") throw new Error("expected a decision");
	return incoming.decision;
}

describe("parsePreviewDecision", () => {
	it("ignores a decision for another request", () => {
		expect(parsePreviewDecision(decision(), "r2")).toBeNull();
	});

	it("ignores a line that is not JSON", () => {
		expect(parsePreviewDecision("not json", "r1")).toBeNull();
	});

	it("surfaces a pr-preview error", () => {
		expect(
			parsePreviewDecision(
				line({ type: "error", message: "pr-preview blew up" }),
				"r1",
			),
		).toEqual({ kind: "error", message: "pr-preview blew up" });
	});

	it("reads the reviewer's chain toggles", () => {
		expect(parsed({ reviewAfter: true, announceAfter: false })).toMatchObject({
			decision: "approve",
			reviewAfter: true,
			announceAfter: false,
		});
	});

	describe("the draft field", () => {
		it("reads an explicit true", () => {
			expect(parsed({ draft: true }).draft).toBe(true);
		});

		it("reads an explicit false rather than treating it as absent", () => {
			expect(parsed({ draft: false }).draft).toBe(false);
		});

		it("is undefined when a client sends no draft field", () => {
			expect(parsed().draft).toBeUndefined();
		});

		it("is undefined when the field is not a boolean", () => {
			expect(parsed({ draft: "yes" }).draft).toBeUndefined();
		});
	});
});
