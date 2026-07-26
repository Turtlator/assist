export type PullResult =
	| { kind: "fast-forwarded"; sha: string }
	| { kind: "blocked"; reason: string };
