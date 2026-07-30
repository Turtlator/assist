import { describe, expect, it } from "vitest";
import { editHelpText } from "./editHelpText";
import { prConcisenessGuidance } from "./prConcisenessGuidance";
import { raiseHelpText } from "./raiseHelpText";

describe("editHelpText", () => {
	it("carries the same conciseness guidance as raise", () => {
		expect(editHelpText()).toContain(prConcisenessGuidance);
		expect(raiseHelpText(false)).toContain(prConcisenessGuidance);
	});

	it("explains that only the supplied sections are replaced", () => {
		expect(editHelpText()).toContain(
			"every other section of the existing body is preserved",
		);
	});

	it("holds the resulting body to the budget, not just the edited section", () => {
		expect(editHelpText()).toContain(
			"the budget applies to the resulting body as a whole",
		);
	});
});
