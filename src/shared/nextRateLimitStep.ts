import {
	rateLimitElapsedFraction,
	rateLimitLevel,
	type RateLimitLevel,
} from "./rateLimitLevel";

type NextRateLimitStep =
	| { kind: "step"; level: Exclude<RateLimitLevel, "ok">; pct: number }
	| { kind: "over" }
	| { kind: "unprojectable" };

export function nextRateLimitStep(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
	now: number,
): NextRateLimitStep {
	const elapsed = rateLimitElapsedFraction(resetsAt, windowSeconds, now);
	if (elapsed == null) return { kind: "unprojectable" };
	const level = rateLimitLevel(pct, resetsAt, windowSeconds, now);
	if (level === "over") return { kind: "over" };
	if (level === "warn")
		return { kind: "step", level: "over", pct: 100 * elapsed };
	return { kind: "step", level: "warn", pct: 75 * elapsed };
}
