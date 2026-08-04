import {
	RATE_LIMIT_OVER_PCT,
	RATE_LIMIT_WARN_PCT,
	rateLimitElapsedFraction,
	type RateLimitLevel,
	rateLimitLevel,
} from "./rateLimitLevel";

type RateLimitBoundary = { level: RateLimitLevel; pct: number };

export type RateLimitRecovery = RateLimitBoundary & { at: number | undefined };

type NextRateLimitStep =
	| {
			kind: "projected";
			recovery: RateLimitRecovery | undefined;
			worse: RateLimitBoundary | undefined;
	  }
	| { kind: "unprojectable" };

function boundaryBelow(
	level: RateLimitLevel,
): { level: RateLimitLevel; boundary: number } | undefined {
	if (level === "over") return { level: "warn", boundary: RATE_LIMIT_OVER_PCT };
	if (level === "warn") return { level: "ok", boundary: RATE_LIMIT_WARN_PCT };
	return undefined;
}

function boundaryAbove(
	level: RateLimitLevel,
): { level: RateLimitLevel; boundary: number } | undefined {
	if (level === "ok") return { level: "warn", boundary: RATE_LIMIT_WARN_PCT };
	if (level === "warn") return { level: "over", boundary: RATE_LIMIT_OVER_PCT };
	return undefined;
}

function fallsBelowBoundaryAt(
	pct: number,
	boundary: number,
	resetsAt: number,
	windowSeconds: number,
): number | undefined {
	if (pct >= boundary) return undefined;
	const elapsedWhenBelow = pct / boundary;
	return Math.round(resetsAt - windowSeconds * (1 - elapsedWhenBelow));
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
	const below = boundaryBelow(level);
	const above = boundaryAbove(level);
	return {
		kind: "projected",
		recovery: below && {
			level: below.level,
			pct: below.boundary * elapsed,
			at: fallsBelowBoundaryAt(pct, below.boundary, resetsAt, windowSeconds),
		},
		worse: above && { level: above.level, pct: above.boundary * elapsed },
	};
}
