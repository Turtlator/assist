import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const mockRequestPreviewDecision = vi.fn();
const runGhGraphqlJson = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("../../../shared/runGhGraphqlJson", () => ({
	runGhGraphqlJson: (...args: unknown[]) => runGhGraphqlJson(...args),
}));

import { createIssue } from "./createIssue";

const ISSUE_URL = "https://github.com/acme/widgets/issues/7";

function graphqlReplies(orgTypes: { id: string; name: string }[]) {
	return (query: string) => {
		if (query.includes("issueTypes")) {
			return JSON.stringify({
				data: { organization: { issueTypes: { nodes: orgTypes } } },
			});
		}
		if (query.includes("issue(number:")) {
			return JSON.stringify({ data: { repository: { issue: { id: "I_1" } } } });
		}
		return JSON.stringify({
			data: { updateIssueIssueType: { issue: { id: "I_1" } } },
		});
	};
}

beforeEach(() => {
	execFileSync.mockReset();
	execFileSync.mockReturnValue(`${ISSUE_URL}\n`);
	mockRequestPreviewDecision.mockReset();
	runGhGraphqlJson.mockReset();
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

describe("createIssue --type", () => {
	it("aborts before creating when the organisation has no such type", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([
				{ id: "IT_epic", name: "Epic" },
				{ id: "IT_bug", name: "Bug" },
			]),
		);

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				type: "Saga",
			}),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("Epic, Bug");
		expect(execFileSync).not.toHaveBeenCalled();
	});

	it("previews the metadata block without posting it in the body", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([{ id: "IT_epic", name: "Epic" }]),
		);

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			type: "epic",
		});

		const previewBody = mockRequestPreviewDecision.mock.calls[0]?.[0]?.body;
		expect(previewBody).toContain("**Repository:** acme/widgets");
		expect(previewBody).toContain("**Type:** Epic");
		expect(previewBody).toContain("Details");

		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"issue",
				"create",
				"--title",
				"Crash on load",
				"--body",
				"Details",
				"--repo",
				"acme/widgets",
			],
			expect.anything(),
		);
	});

	it("applies the resolved type to the created issue", async () => {
		runGhGraphqlJson.mockImplementation(
			graphqlReplies([{ id: "IT_epic", name: "Epic" }]),
		);

		await createIssue({
			title: "Crash on load",
			body: "Details",
			repo: "acme/widgets",
			type: "Epic",
		});

		expect(runGhGraphqlJson).toHaveBeenCalledWith(
			expect.stringContaining("updateIssueIssueType"),
			{ issueId: "I_1", issueTypeId: "IT_epic" },
		);
	});

	it("reports the created issue and the failing step when typing fails", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitThrows();
		runGhGraphqlJson.mockImplementation((query: string) => {
			if (query.includes("issueTypes")) {
				return JSON.stringify({
					data: {
						organization: {
							issueTypes: { nodes: [{ id: "IT_epic", name: "Epic" }] },
						},
					},
				});
			}
			throw new Error("HTTP 403");
		});

		await expect(
			createIssue({
				title: "Crash on load",
				body: "Details",
				repo: "acme/widgets",
				type: "Epic",
			}),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain(ISSUE_URL);
		expect(output).toContain("issue type to Epic");
		expect(output).toContain("HTTP 403");
	});
});
