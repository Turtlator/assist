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
		).toEqual({
			kind: "projected",
			recovery: undefined,
			worse: { level: "warn", pct: 30 },
		});
	});

	it("steps a yellow window back to green and on to red", () => {
		expect(
			nextRateLimitStep(35, resetsAtElapsed(0.4), FIVE_HOUR_SECONDS, NOW),
		).toEqual({
			kind: "projected",
			recovery: { level: "ok", pct: 30, at: NOW + 20 * 60 },
			worse: { level: "over", pct: 40 },
		});
	});

	it("leaves a yellow window at or over 75% without a recovery moment", () => {
		expect(
			nextRateLimitStep(80, resetsAtElapsed(0.9), FIVE_HOUR_SECONDS, NOW),
		).toEqual({
			kind: "projected",
			recovery: { level: "ok", pct: 67.5, at: undefined },
			worse: { level: "over", pct: 90 },
		});
	});

	it("steps a red window back to yellow at 100 x elapsed", () => {
		expect(
			nextRateLimitStep(45, resetsAtElapsed(0.4), FIVE_HOUR_SECONDS, NOW),
		).toEqual({
			kind: "projected",
			recovery: { level: "warn", pct: 40, at: NOW + 15 * 60 },
			worse: undefined,
		});
	});

	it("leaves a red window at or over 100% without a recovery moment", () => {
		expect(
			nextRateLimitStep(120, resetsAtElapsed(0.4), FIVE_HOUR_SECONDS, NOW),
		).toEqual({
			kind: "projected",
			recovery: { level: "warn", pct: 40, at: undefined },
			worse: undefined,
		});
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
