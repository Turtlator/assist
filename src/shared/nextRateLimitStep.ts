import {
	rateLimitElapsedFraction,
	rateLimitLevel,
	type RateLimitLevel,
} from "./rateLimitLevel";

type NextRateLimitStep =
	| { kind: "step"; level: Exclude<RateLimitLevel, "ok">; pct: number }
	| { kind: "over"; pct: number; recoversAt: number | undefined }
	| { kind: "unprojectable" };

function projectionFallsUnderAt(
	pct: number,
	resetsAt: number,
	windowSeconds: number,
): number | undefined {
	if (pct >= 100) return undefined;
	const elapsedWhenUnder = pct / 100;
	return resetsAt - windowSeconds * (1 - elapsedWhenUnder);
}

export function nextRateLimitStep(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
	now: number,
): NextRateLimitStep {
	if (resetsAt == null) return { kind: "unprojectable" };
	const elapsed = rateLimitElapsedFraction(resetsAt, windowSeconds, now);
	if (elapsed == null) return { kind: "unprojectable" };
	const level = rateLimitLevel(pct, resetsAt, windowSeconds, now);
	if (level === "over")
		return {
			kind: "over",
			pct: 100 * elapsed,
			recoversAt: projectionFallsUnderAt(pct, resetsAt, windowSeconds),
		};
	if (level === "warn")
		return { kind: "step", level: "over", pct: 100 * elapsed };
	return { kind: "step", level: "warn", pct: 75 * elapsed };
}
