type Described = { id?: string; name?: string; cwd?: string };

export function describePersistedSession(entry: unknown): string {
	const { id, name, cwd } = readDescribed(entry);
	return `id=${id ?? "?"} name=${JSON.stringify(name ?? "?")} cwd=${cwd ?? "?"}`;
}

function readDescribed(entry: unknown): Described {
	if (typeof entry !== "object" || entry === null) return {};
	const record = entry as Record<string, unknown>;
	return {
		id: stringOrUndefined(record.id),
		name: stringOrUndefined(record.name),
		cwd: stringOrUndefined(record.cwd),
	};
}

function stringOrUndefined(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}
