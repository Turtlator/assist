import { describe, expect, it } from "vitest";
import { codexRolloutMeta } from "./codexRolloutMeta";

function line(entry: unknown): string {
	return JSON.stringify(entry);
}

const sessionMeta = line({
	type: "session_meta",
	payload: {
		session_id: "019fe63a",
		cwd: "/home/me/repo",
		timestamp: "2026-08-09T11:13:54.257Z",
		originator: "codex-tui",
	},
});

describe("codexRolloutMeta", () => {
	it("reads the conversation id, cwd and start time from session_meta", () => {
		const meta = codexRolloutMeta([sessionMeta]);

		expect(meta).toEqual({
			sessionId: "019fe63a",
			cwd: "/home/me/repo",
			timestamp: "2026-08-09T11:13:54.257Z",
			firstMessage: "",
		});
	});

	it("names the session after the first prompt the user submitted", () => {
		const meta = codexRolloutMeta([
			sessionMeta,
			line({
				type: "response_item",
				payload: { type: "message", role: "user", content: [] },
			}),
			line({
				type: "event_msg",
				payload: { type: "user_message", message: "  refine a667  " },
			}),
			line({
				type: "event_msg",
				payload: { type: "user_message", message: "later message" },
			}),
		]);

		expect(meta.firstMessage).toBe("refine a667");
	});

	it("returns no session id for a file that is not a rollout", () => {
		expect(codexRolloutMeta(["not json", "{}"]).sessionId).toBe("");
	});
});
