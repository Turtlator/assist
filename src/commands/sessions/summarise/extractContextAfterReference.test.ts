import { closeSync, openSync, readSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
	openSync: vi.fn(),
	readSync: vi.fn(),
	closeSync: vi.fn(),
}));

import { extractContextAfterReference } from "./extractContextAfterReference";

const mockOpenSync = openSync as unknown as ReturnType<typeof vi.fn>;
const mockReadSync = readSync as unknown as ReturnType<typeof vi.fn>;
const mockCloseSync = closeSync as unknown as ReturnType<typeof vi.fn>;

const JIRA_URL = "https://centium.atlassian.net/browse/PA-556";

const AGENT_SUMMARY =
	"PA-556 reports that saving a client record silently drops the contact " +
	"email when the form is submitted twice. The fix likely belongs in the " +
	"save handler.";

function userLine(text: string): string {
	return JSON.stringify({
		type: "user",
		message: { role: "user", content: text },
	});
}

function assistantLine(text: string): string {
	return JSON.stringify({
		type: "assistant",
		message: { role: "assistant", content: [{ type: "text", text }] },
	});
}

function toolResultLine(): string {
	return JSON.stringify({
		type: "user",
		message: {
			role: "user",
			content: [{ type: "tool_result", content: "a very long tool payload" }],
		},
	});
}

function toolUseLine(): string {
	return JSON.stringify({
		type: "assistant",
		message: {
			role: "assistant",
			content: [
				{ type: "tool_use", name: "getJiraIssue", input: { issue: "PA-556" } },
			],
		},
	});
}

function mockFileContent(lines: string[]) {
	mockOpenSync.mockReturnValue(42);
	mockReadSync.mockImplementation((_fd: number, buf: Buffer) => {
		const bytes = Buffer.from(lines.join("\n"), "utf8");
		bytes.copy(buf);
		return bytes.length;
	});
}

describe("extractContextAfterReference", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns nothing when the file cannot be read", () => {
		mockOpenSync.mockImplementation(() => {
			throw new Error("ENOENT");
		});

		expect(extractContextAfterReference("/missing.jsonl")).toBeUndefined();
	});

	it("returns nothing when the transcript holds only the reference", () => {
		mockFileContent([userLine(JIRA_URL)]);

		expect(extractContextAfterReference("/s.jsonl")).toBeUndefined();
	});

	it("returns nothing while the context is still too thin to summarise", () => {
		mockFileContent([
			userLine(JIRA_URL),
			assistantLine("Let me look at that."),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBeUndefined();
	});

	it("summarises the context that follows the reference, not the reference", () => {
		mockFileContent([
			userLine(JIRA_URL),
			toolUseLine(),
			toolResultLine(),
			assistantLine(AGENT_SUMMARY),
		]);

		const context = extractContextAfterReference("/s.jsonl");

		expect(context).toBe(AGENT_SUMMARY);
		expect(context).not.toContain(JIRA_URL);
	});

	it("keeps prose that shares the opening message with a reference", () => {
		mockFileContent([
			userLine(`${JIRA_URL} ${AGENT_SUMMARY}`),
			assistantLine("On it."),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toContain(AGENT_SUMMARY);
	});

	it("joins several turns of context together", () => {
		mockFileContent([
			userLine("PA-556"),
			assistantLine("What triggers the failure?"),
			userLine("Saving a client record twice loses the contact email"),
			assistantLine(
				"Understood, I will file that as a bug for the save handler",
			),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBe(
			[
				"What triggers the failure?",
				"Saving a client record twice loses the contact email",
				"Understood, I will file that as a bug for the save handler",
			].join("\n"),
		);
	});

	it("skips sidechain and meta entries", () => {
		mockFileContent([
			userLine(JIRA_URL),
			JSON.stringify({
				type: "assistant",
				isSidechain: true,
				message: {
					role: "assistant",
					content: [{ type: "text", text: "x".repeat(200) }],
				},
			}),
			JSON.stringify({
				type: "user",
				isMeta: true,
				message: { role: "user", content: "y".repeat(200) },
			}),
			assistantLine(AGENT_SUMMARY),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBe(AGENT_SUMMARY);
	});

	it("skips malformed lines", () => {
		mockFileContent([
			userLine(JIRA_URL),
			"not json",
			assistantLine(AGENT_SUMMARY),
		]);

		expect(extractContextAfterReference("/s.jsonl")).toBe(AGENT_SUMMARY);
	});

	it("caps the context it hands to the summariser", () => {
		mockFileContent([userLine(JIRA_URL), assistantLine("z".repeat(2000))]);

		expect(extractContextAfterReference("/s.jsonl")).toHaveLength(800);
	});

	it("closes the file descriptor", () => {
		mockFileContent([userLine(JIRA_URL), assistantLine(AGENT_SUMMARY)]);

		extractContextAfterReference("/s.jsonl");

		expect(mockCloseSync).toHaveBeenCalledWith(42);
	});
});
