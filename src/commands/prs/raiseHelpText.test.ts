import { describe, expect, it } from "vitest";
import { raiseHelpText } from "./raiseHelpText";

describe("raiseHelpText", () => {
	it("instructs asking the user for a Jira key when promptJira is true", () => {
		const help = raiseHelpText(true);
		expect(help).toContain("--resolves <key>");
		expect(help).toContain(
			"ask the user whether this PR\n                    resolves a Jira issue",
		);
	});

	it("omits the prompt instruction but keeps --resolves documented when promptJira is false", () => {
		const help = raiseHelpText(false);
		expect(help).toContain("--resolves <key>");
		expect(help).not.toContain("ask the user whether this PR");
	});

	it("demands a terse register, not just a sentence count", () => {
		const help = raiseHelpText(false);
		expect(help).toContain("Terse technical register");
		expect(help).toContain("Sentence count is a floor on brevity");
	});

	it("states that the budget applies to the whole body", () => {
		const help = raiseHelpText(false);
		expect(help).toContain(
			"The budget is a total, not a per-paragraph allowance",
		);
		expect(help).toContain(
			"long-winded overall is wrong even\nwhen each paragraph is individually short",
		);
	});
});
