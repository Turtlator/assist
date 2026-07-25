const BASENAME_WEIGHT = 1000;
const START_BONUS = 15;
const BOUNDARY_BONUS = 10;
const CONSECUTIVE_BONUS = 8;
const MAX_GAP_PENALTY = 6;
const MAX_LENGTH_PENALTY = 100;

function isBoundary(text: string, index: number): boolean {
	if (index === 0) return true;
	const previous = text[index - 1] ?? "";
	if (!/[A-Za-z0-9]/.test(previous)) return true;
	return /[a-z0-9]/.test(previous) && /[A-Z]/.test(text[index] ?? "");
}

function subsequenceScore(text: string, query: string): number | null {
	const lower = text.toLowerCase();
	let score = 0;
	let cursor = 0;
	let previous = -1;
	for (const char of query) {
		const at = lower.indexOf(char, cursor);
		if (at === -1) return null;
		if (at === previous + 1) score += CONSECUTIVE_BONUS;
		if (isBoundary(text, at)) score += BOUNDARY_BONUS;
		if (at === 0) score += START_BONUS;
		score -= Math.min(at - cursor, MAX_GAP_PENALTY);
		previous = at;
		cursor = at + 1;
	}
	return score - Math.min(text.length, MAX_LENGTH_PENALTY);
}

export function scoreFilePath(path: string, query: string): number | null {
	const needle = query.trim().toLowerCase();
	if (!needle) return 0;
	const basename = path.slice(path.lastIndexOf("/") + 1);
	const inBasename = subsequenceScore(basename, needle);
	if (inBasename !== null) return BASENAME_WEIGHT + inBasename;
	return subsequenceScore(path, needle);
}
