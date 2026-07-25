import { gitResult } from "./git";

export type HeldWork = { summary: string; items: string[] };

const MAX_ITEMS = 20;

export async function describeHeldWork(
	path: string,
	reason: string,
): Promise<HeldWork> {
	if (reason.startsWith("uncommitted")) return await changedFiles(path);
	if (reason.startsWith("unpushed")) return await unpushedCommits(path, reason);
	return { summary: reason, items: [] };
}

async function changedFiles(path: string): Promise<HeldWork> {
	const status = await gitResult(path, ["status", "--porcelain"]);
	const lines = status.ok ? nonEmptyLines(status.out) : [];
	return {
		summary: `${lines.length} uncommitted ${lines.length === 1 ? "file" : "files"}`,
		items: capped(lines),
	};
}

async function unpushedCommits(
	path: string,
	reason: string,
): Promise<HeldWork> {
	const log = await gitResult(path, ["log", "--oneline", "@{upstream}..HEAD"]);
	if (!log.ok) return { summary: reason, items: [] };
	const lines = nonEmptyLines(log.out);
	return {
		summary: `${lines.length} unpushed ${lines.length === 1 ? "commit" : "commits"}`,
		items: capped(lines),
	};
}

function nonEmptyLines(out: string): string[] {
	return out
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line !== "");
}

function capped(lines: string[]): string[] {
	if (lines.length <= MAX_ITEMS) return lines;
	return [
		...lines.slice(0, MAX_ITEMS),
		`… and ${lines.length - MAX_ITEMS} more`,
	];
}
