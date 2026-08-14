import { describe, expect, it, vi } from "vitest";
import { validateProposedContent } from "./validateProposedContent";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
vi.spyOn(console, "error").mockImplementation(() => {});

const prLabels = { subject: "PR", context: "PRs" };
const issueLabels = { subject: "Issue", context: "GitHub issues" };

describe("validateProposedContent", () => {
	describe("when the title mentions claude", () => {
		it("should reject for a PR", () => {
			expect(() =>
				validateProposedContent(prLabels, "Add feature with Claude", "Clean"),
			).toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
		});

		it("should reject for an issue", () => {
			expect(() =>
				validateProposedContent(
					issueLabels,
					"Crash noticed by Claude",
					"Clean",
				),
			).toThrow("process.exit");
		});
	});

	describe("when the body mentions claude", () => {
		it("should reject for a PR", () => {
			expect(() =>
				validateProposedContent(prLabels, "Add feature", "Made with CLAUDE"),
			).toThrow("process.exit");
		});

		it("should reject for an issue", () => {
			expect(() =>
				validateProposedContent(
					issueLabels,
					"Crash on load",
					"Found by claude",
				),
			).toThrow("process.exit");
		});
	});

	describe("when the content references a backlog item", () => {
		it("should reject a PR title id", () => {
			expect(() =>
				validateProposedContent(prLabels, "Fix bug from a706", "Clean"),
			).toThrow("process.exit");
		});

		it("should reject an issue title id", () => {
			expect(() =>
				validateProposedContent(issueLabels, "Crash from a706", "Clean"),
			).toThrow("process.exit");
		});

		it("should reject a PR body id", () => {
			expect(() =>
				validateProposedContent(prLabels, "Fix bug", "Implements a706."),
			).toThrow("process.exit");
		});

		it("should reject an issue body id", () => {
			expect(() =>
				validateProposedContent(
					issueLabels,
					"Crash on load",
					"See backlog item a706 for context.",
				),
			).toThrow("process.exit");
		});

		it("names the subject and context in the error", () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			expect(() =>
				validateProposedContent(issueLabels, "Crash from a706", "Clean"),
			).toThrow("process.exit");
			const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
			expect(output).toContain("Issue title");
			expect(output).toContain("GitHub issues");
		});
	});

	describe("when the content is clean", () => {
		it("should not throw for a PR", () => {
			expect(() =>
				validateProposedContent(prLabels, "Add feature", "Adds the feature."),
			).not.toThrow();
		});

		it("should not throw for an issue", () => {
			expect(() =>
				validateProposedContent(
					issueLabels,
					"Crash on load",
					"Opening the app on data706 records crashes. Closes #42.",
				),
			).not.toThrow();
		});
	});
});
