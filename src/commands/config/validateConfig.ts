import type { z } from "zod";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { scrubConfigSecrets } from "../../shared/scrubConfigSecrets";
import { stripLegacyConfigKeys } from "../../shared/stripLegacyConfigKeys";
import { assistConfigSchema } from "../../shared/types";

type ConfigValidationResult = { ok: true } | { ok: false; errors: string[] };

type ConfigValidationIssue = {
	path: PropertyKey[];
	message: string;
	keys?: string[];
};

export function validateConfig(
	updated: Record<string, unknown>,
	key: string,
	schema: z.ZodTypeAny = assistConfigSchema,
): ConfigValidationResult {
	const result = schema.safeParse(stripLegacyConfigKeys(updated));
	if (result.success) return { ok: true };
	const errors = result.error.issues.flatMap((issue) =>
		formatIssue(issue, key),
	);
	return {
		ok: false,
		errors: scrubConfigSecrets(errors, updated, describeConfigNode(schema)),
	};
}

function formatIssue(issue: ConfigValidationIssue, key: string): string[] {
	if (issue.keys)
		return issue.keys.map(
			(unrecognized) =>
				`${[...issue.path, unrecognized].join(".")}: Unrecognized key`,
		);
	const path = issue.path.length > 0 ? issue.path.join(".") : key;
	return [`${path}: ${issue.message}`];
}
