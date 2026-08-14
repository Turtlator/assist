import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const mockRequestPreviewDecision = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

import { createIssue } from "./createIssue";

beforeEach(() => {
	execFileSync.mockReset();
	mockRequestPreviewDecision.mockReset();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
	vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

function exitThrows() {
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
}

describe("createIssue arguments", () => {
	it("requires a title and a body", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(createIssue({ body: "Details" })).rejects.toThrow(
			"process.exit",
		);
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("delegates to gh issue create", async () => {
		await createIssue({ title: "Crash on load", body: "Details" });

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			["issue", "create", "--title", "Crash on load", "--body", "Details"],
			expect.anything(),
		);
	});

	it("passes the target repo through", async () => {
		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
		});

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining(["--repo", "acme/widgets"]),
			expect.anything(),
		);
	});

	it("rejects a title referencing claude", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			createIssue({ title: "Crash found by Claude", body: "Details" }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("rejects a body referencing a backlog item", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();

		await expect(
			createIssue({ title: "Crash on load", body: "Tracked as a706." }),
		).rejects.toThrow("process.exit");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});

describe("createIssue preview", () => {
	it("creates without a preview outside a web session", async () => {
		await createIssue({ title: "Crash on load", body: "Details" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(execFileSync).toHaveBeenCalled();
	});

	it("previews the issue in a web session and creates it on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await createIssue({ title: "Crash on load", body: "Details" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				title: "Crash on load",
				body: "Details",
				kind: "github-issue",
				prNumber: null,
			}),
		);
		expect(execFileSync).toHaveBeenCalled();
	});

	it("exits non-zero without creating when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "needs repro steps",
			comments: [{ quote: "Details", note: "list the steps" }],
		});

		await expect(
			createIssue({ title: "Crash on load", body: "Details" }),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("needs repro steps");
		expect(output).toContain("> Details");
		expect(output).toContain("list the steps");
		expect(execFileSync).not.toHaveBeenCalled();
	});
});
