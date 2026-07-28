import type { z } from "zod";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { scrubConfigSecrets } from "../../shared/scrubConfigSecrets";
import { assistConfigSchema } from "../../shared/types";

type ConfigValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateConfig(
	updated: Record<string, unknown>,
	key: string,
	schema: z.ZodTypeAny = assistConfigSchema,
): ConfigValidationResult {
	const result = schema.safeParse(updated);
	if (result.success) return { ok: true };
	const errors = result.error.issues.map((issue) => formatIssue(issue, key));
	return {
		ok: false,
		errors: scrubConfigSecrets(errors, updated, describeConfigNode(schema)),
	};
}

function formatIssue(
	issue: { path: PropertyKey[]; message: string },
	key: string,
): string {
	const path = issue.path.length > 0 ? issue.path.join(".") : key;
	return `${path}: ${issue.message}`;
}
