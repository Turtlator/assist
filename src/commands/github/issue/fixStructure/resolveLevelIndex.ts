import { normaliseTypeName } from "./normaliseTypeName";

export function resolveLevelIndex(
	chain: string[],
	name: string | null | undefined,
): number {
	if (!name) return -1;
	const wanted = normaliseTypeName(name);
	return chain.findIndex((level) => normaliseTypeName(level) === wanted);
}
