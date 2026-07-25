import { scoreFilePath } from "./scoreFilePath";

export function rankFilePaths(
	paths: string[],
	query: string,
	limit: number,
): string[] {
	const scored: { path: string; score: number }[] = [];
	for (const path of paths) {
		const score = scoreFilePath(path, query);
		if (score !== null) scored.push({ path, score });
	}
	scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
	return scored.slice(0, limit).map((entry) => entry.path);
}
