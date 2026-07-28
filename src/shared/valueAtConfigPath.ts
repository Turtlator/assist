export type ConfigValuePath = (string | number)[];

export function valueAtConfigPath(
	value: unknown,
	path: ConfigValuePath,
): unknown {
	let current = value;
	for (const key of path) {
		if (typeof key === "number") {
			if (!Array.isArray(current)) return undefined;
			current = current[key];
			continue;
		}
		if (typeof current !== "object" || current === null) return undefined;
		current = (current as Record<string, unknown>)[key];
	}
	return current;
}
