import type { ConfigNode } from "./ConfigNode";
import { mapConfigSecrets } from "./mapConfigSecrets";

export const REDACTED_SECRET = { assistSecret: "set" } as const;

export function isRedactedSecret(value: unknown): boolean {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as { assistSecret?: unknown }).assistSecret === "set"
	);
}

export function redactConfigSecrets(
	value: unknown,
	node: ConfigNode | undefined,
): unknown {
	return mapConfigSecrets(value, node, () => REDACTED_SECRET);
}
