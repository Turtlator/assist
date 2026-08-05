import { describe, expect, it } from "vitest";
import { canAddAgent } from "./canAddAgent";
import type { SessionInfo } from "./types";

function card(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "3",
		name: "assist backlog run 5",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		cwd: "/git/repo-2",
		...overrides,
	};
}

describe("canAddAgent", () => {
	it("is offered on a session working in a repo", () => {
		expect(canAddAgent(card())).toBe(true);
	});

	it("is offered on a session awaiting input", () => {
		expect(canAddAgent(card({ status: "waiting" }))).toBe(true);
	});

	it("is withheld from a server run", () => {
		expect(canAddAgent(card({ commandType: "run" }))).toBe(false);
	});

	it("is withheld while a workspace is being torn down", () => {
		expect(canAddAgent(card({ closing: true }))).toBe(false);
	});

	it("is offered on a finished, errored or stopped card", () => {
		expect(canAddAgent(card({ status: "done" }))).toBe(true);
		expect(canAddAgent(card({ status: "error" }))).toBe(true);
		expect(canAddAgent(card({ status: "stopped" }))).toBe(true);
	});

	it("is withheld with no working directory to share", () => {
		expect(canAddAgent(card({ cwd: undefined }))).toBe(false);
	});
});
