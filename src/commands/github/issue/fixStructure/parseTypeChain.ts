import { normaliseTypeName } from "./normaliseTypeName";

export function parseTypeChain(value: string): string[] {
	const chain = value
		.split(/[,>]/)
		.map((name) => name.trim())
		.filter((name) => name.length > 0);
	if (chain.length < 2) {
		throw new Error(
			`--type-chain needs at least two levels, like Epic,Story,Subtask, not "${value}"`,
		);
	}
	const seen = new Set<string>();
	for (const level of chain) {
		const key = normaliseTypeName(level);
		if (seen.has(key)) {
			throw new Error(`--type-chain repeats ${level}; each level must differ`);
		}
		seen.add(key);
	}
	return chain;
}
