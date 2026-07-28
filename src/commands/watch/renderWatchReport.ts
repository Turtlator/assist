import type { CommitEntry } from "./CommitEntry";

type WatchReport = {
	version: string;
	commits: CommitEntry[];
	newShas: string[];
	restarts: string[];
};

const escapeCell = (text: string): string =>
	text.replaceAll("|", String.raw`\|`);

export function renderWatchReport({
	version,
	commits,
	newShas,
	restarts,
}: WatchReport): string {
	const isNew = new Set(newShas);
	const lines = [`**Version** ${version}`, ""];

	if (commits.length === 0) {
		lines.push("_no commits_");
	} else {
		lines.push("| SHA | When | Subject |", "| --- | --- | --- |");
		for (const commit of commits) {
			const marker = isNew.has(commit.sha) ? " ← new" : "";
			lines.push(
				`| \`${commit.short}\` | ${commit.when} | ${escapeCell(commit.subject)}${marker} |`,
			);
		}
	}

	lines.push("", "**Restarts**", "");
	lines.push(
		...(restarts.length === 0
			? ["- none needed"]
			: restarts.map((restart) => `- ${restart}`)),
	);

	return lines.join("\n");
}
