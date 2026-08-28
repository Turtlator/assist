import { describe, expect, it } from "vitest";
import { collectLabels } from "./collectLabels";

describe("collectLabels", () => {
	it("accumulates a repeated flag", () => {
		expect(collectLabels("ui", collectLabels("bug", []))).toEqual([
			"bug",
			"ui",
		]);
	});

	it("splits and trims a comma-separated list", () => {
		expect(collectLabels("bug, needs triage ,", [])).toEqual([
			"bug",
			"needs triage",
		]);
	});
});
