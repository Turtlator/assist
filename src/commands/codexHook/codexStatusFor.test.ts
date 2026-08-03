import { describe, expect, it } from "vitest";
import { codexStatusFor } from "./codexStatusFor";

describe("codexStatusFor", () => {
	it("reports running when the user submits a prompt", () => {
		expect(codexStatusFor("UserPromptSubmit", false)).toEqual({
			status: "running",
			source: "prompt",
		});
	});

	it("reports running around tool calls", () => {
		expect(codexStatusFor("PreToolUse", false)).toEqual({
			status: "running",
			source: "pretool",
		});
		expect(codexStatusFor("PostToolUse", false)).toEqual({
			status: "running",
			source: "posttool",
		});
	});

	it("reports waiting when the turn stops, waiting for the daemon to ack", () => {
		expect(codexStatusFor("Stop", false)).toEqual({
			status: "waiting",
			source: "stop",
			ack: true,
		});
	});

	it("reports waiting for a permission request it did not decide", () => {
		expect(codexStatusFor("PermissionRequest", false)).toEqual({
			status: "waiting",
			source: "permission",
			ack: true,
		});
	});

	it("reports running for a permission request it auto-approved", () => {
		expect(codexStatusFor("PermissionRequest", true)).toEqual({
			status: "running",
			source: "permission",
		});
	});

	it("reports nothing for events that do not change the status", () => {
		expect(codexStatusFor("SessionStart", false)).toBeUndefined();
		expect(codexStatusFor("PreCompact", true)).toBeUndefined();
	});
});
