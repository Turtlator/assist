import { describe, expect, it } from "vitest";
import { resolveFixStructureTarget } from "./resolveFixStructureTarget";

describe("resolveFixStructureTarget", () => {
	it("resolves a URL and shorthand to the same target", () => {
		const fromUrl = resolveFixStructureTarget(
			"https://github.com/staff0rd/assist/issues/12",
			undefined,
		);
		const fromShorthand = resolveFixStructureTarget(
			"staff0rd/assist#12",
			undefined,
		);
		expect(fromUrl).toEqual({ owner: "staff0rd", repo: "assist", number: 12 });
		expect(fromShorthand).toEqual(fromUrl);
	});

	it("ignores --repo when the target already names one", () => {
		expect(
			resolveFixStructureTarget("staff0rd/assist#12", "other/repo"),
		).toEqual({ owner: "staff0rd", repo: "assist", number: 12 });
	});

	it("resolves a bare number against --repo", () => {
		expect(resolveFixStructureTarget("12", "staff0rd/assist")).toEqual({
			owner: "staff0rd",
			repo: "assist",
			number: 12,
		});
		expect(resolveFixStructureTarget("#12", "staff0rd/assist")).toEqual({
			owner: "staff0rd",
			repo: "assist",
			number: 12,
		});
	});

	it("refuses a bare number with no repo rather than guessing one", () => {
		expect(() => resolveFixStructureTarget("12", undefined)).toThrow(
			/--repo owner\/repo/,
		);
	});

	it("refuses a --repo that is not owner/repo", () => {
		expect(() => resolveFixStructureTarget("12", "assist")).toThrow(
			/--repo must be owner\/repo/,
		);
	});

	it("refuses input that is not an issue reference", () => {
		expect(() =>
			resolveFixStructureTarget(
				"https://github.com/staff0rd/assist/pull/5",
				undefined,
			),
		).toThrow(/Could not read/);
		expect(() =>
			resolveFixStructureTarget("nonsense", "staff0rd/assist"),
		).toThrow(/Could not read/);
	});
});
