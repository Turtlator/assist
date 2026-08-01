type ConfigArrayMergeStrategy =
	| { kind: "keyed"; field: string }
	| { kind: "concat" }
	| { kind: "replace" };

const STRATEGIES: Record<string, ConfigArrayMergeStrategy> = {
	run: { kind: "keyed", field: "name" },
	deny: { kind: "keyed", field: "pattern" },
	subtasks: { kind: "concat" },
};

export function configArrayMergeStrategy(
	key: string,
): ConfigArrayMergeStrategy {
	return STRATEGIES[key] ?? { kind: "replace" };
}
