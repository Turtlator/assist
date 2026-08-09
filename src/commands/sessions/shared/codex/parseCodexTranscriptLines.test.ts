import { describe, expect, it } from "vitest";
import { parseCodexTranscriptLines } from "./parseCodexTranscriptLines";

function line(entry: unknown): string {
	return JSON.stringify(entry);
}

describe("parseCodexTranscriptLines", () => {
	it("reads the conversation from the rollout's event stream", () => {
		const messages = parseCodexTranscriptLines([
			line({ type: "session_meta", payload: { session_id: "c1" } }),
			line({
				type: "event_msg",
				payload: { type: "user_message", message: "what time is it" },
			}),
			line({
				type: "event_msg",
				payload: { type: "agent_message", message: "It is 9pm." },
			}),
		]);

		expect(messages).toEqual([
			{ role: "user", text: "what time is it" },
			{ role: "assistant", text: "It is 9pm." },
		]);
	});

	it("skips the developer instructions replayed as api messages", () => {
		const messages = parseCodexTranscriptLines([
			line({
				type: "response_item",
				payload: {
					type: "message",
					role: "user",
					content: [{ type: "input_text", text: "# AGENTS.md instructions" }],
				},
			}),
		]);

		expect(messages).toEqual([]);
	});

	it("shows the command a tool call ran", () => {
		const messages = parseCodexTranscriptLines([
			line({
				type: "response_item",
				payload: {
					type: "function_call",
					name: "exec_command",
					arguments: JSON.stringify({ cmd: "git status", workdir: "/repo" }),
				},
			}),
		]);

		expect(messages).toEqual([
			{ role: "tool", tool: "exec_command", target: "git status" },
		]);
	});

	it("shows the script a custom tool call ran", () => {
		const messages = parseCodexTranscriptLines([
			line({
				type: "response_item",
				payload: {
					type: "custom_tool_call",
					name: "exec",
					input: "const r = await tools.web__run({});\n",
				},
			}),
		]);

		expect(messages).toEqual([
			{
				role: "tool",
				tool: "exec",
				target: "const r = await tools.web__run({});",
			},
		]);
	});

	it("ignores unparseable and blank lines", () => {
		expect(parseCodexTranscriptLines(["", "not json"])).toEqual([]);
	});
});
