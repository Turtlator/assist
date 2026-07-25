import { assistConfigSchema } from "../../shared/types";

type ConfigValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateConfig(
	updated: Record<string, unknown>,
	key: string,
): ConfigValidationResult {
	const result = assistConfigSchema.safeParse(updated);
	if (result.success) return { ok: true };
	return {
		ok: false,
		errors: result.error.issues.map((issue) => formatIssue(issue, key)),
	};
}

function formatIssue(
	issue: { path: PropertyKey[]; message: string },
	key: string,
): string {
	const path = issue.path.length > 0 ? issue.path.join(".") : key;
	return `${path}: ${issue.message}`;
}
