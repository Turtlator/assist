export function throwOnGraphqlErrors(stdout: string): void {
	let parsed: unknown;
	try {
		parsed = JSON.parse(stdout);
	} catch {
		return;
	}
	if (!parsed || typeof parsed !== "object") return;
	const errors = (parsed as { errors?: unknown }).errors;
	if (!Array.isArray(errors) || errors.length === 0) return;
	const messages = errors
		.map((entry) =>
			entry && typeof entry === "object" && "message" in entry
				? String((entry as { message: unknown }).message)
				: String(entry),
		)
		.join("; ");
	throw new Error(messages || "GraphQL request returned errors");
}
