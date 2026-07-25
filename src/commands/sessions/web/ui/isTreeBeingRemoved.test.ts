import { describe, expect, it } from "vitest";
import { isTreeBeingRemoved } from "./isTreeBeingRemoved";
import type { SessionInfo } from "./types";

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "session",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

describe("isTreeBeingRemoved", () => {
	it("pauses git status while the session holding that tree is closing", () => {
		const sessions = [session({ cwd: "/git/repo-2", closing: true })];

		expect(isTreeBeingRemoved(sessions, "/git/repo-2")).toBe(true);
	});

	it("keeps reporting for a tree whose session is merely running", () => {
		const sessions = [session({ cwd: "/git/repo-2" })];

		expect(isTreeBeingRemoved(sessions, "/git/repo-2")).toBe(false);
	});

	it("does not pause a different tree because some other card is closing", () => {
		const sessions = [session({ cwd: "/git/repo-3", closing: true })];

		expect(isTreeBeingRemoved(sessions, "/git/repo-2")).toBe(false);
	});

	it("is false when no repo is selected", () => {
		const sessions = [session({ cwd: "", closing: true })];

		expect(isTreeBeingRemoved(sessions, "")).toBe(false);
	});
});
