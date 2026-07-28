export type RunCommandResult =
	| { kind: "completed"; exitCode: number; output: string }
	| { kind: "failed"; message: string };
