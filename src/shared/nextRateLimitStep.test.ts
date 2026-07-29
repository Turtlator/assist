import { describe, expect, it } from "vitest";
import { nextRateLimitStep } from "./nextRateLimitStep";
import { FIVE_HOUR_SECONDS, SEVEN_DAY_SECONDS } from "./rateLimitLevel";

const NOW = 1_000_000;

function resetsAtElapsed(fraction: number): number {
	return NOW + FIVE_HOUR_SECONDS * (1 - fraction);
}

describe("nextRateLimitStep", () => {
	it("steps a green window to yellow at 75 x elapsed", () => {
		expect(
			nextRateLimitStep(18, resetsAtElapsed(0.4), FIVE_HOUR_SECONDS, NOW),
		).toEqual({ kind: "step", level: "warn", pct: 30 });
	});

	it("steps a yellow window to red at 100 x elapsed", () => {
		expect(
			nextRateLimitStep(35, resetsAtElapsed(0.4), FIVE_HOUR_SECONDS, NOW),
		).toEqual({ kind: "step", level: "over", pct: 40 });
	});

	it("reports a window projected over as already over", () => {
		expect(
			nextRateLimitStep(45, resetsAtElapsed(0.4), FIVE_HOUR_SECONDS, NOW),
		).toEqual({ kind: "over" });
	});

	it("reports a window below 5% elapsed as unprojectable", () => {
		expect(
			nextRateLimitStep(2, resetsAtElapsed(0.04), FIVE_HOUR_SECONDS, NOW),
		).toEqual({ kind: "unprojectable" });
	});

	it("reports a window without a reset time as unprojectable", () => {
		expect(nextRateLimitStep(18, undefined, FIVE_HOUR_SECONDS, NOW)).toEqual({
			kind: "unprojectable",
		});
	});

	it("reports a 7d window in its first 8 hours as unprojectable", () => {
		expect(
			nextRateLimitStep(
				1,
				NOW + SEVEN_DAY_SECONDS - 8 * 3600,
				SEVEN_DAY_SECONDS,
				NOW,
			),
		).toEqual({ kind: "unprojectable" });
	});
});
