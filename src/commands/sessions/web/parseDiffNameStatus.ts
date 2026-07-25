import type { GitStatusCounts } from "./parseGitStatus";

function categorize(code: string): keyof GitStatusCounts | null {
	switch (code) {
		case "A":
		case "C":
			return "new";
		case "D":
			return "deleted";
		case "M":
		case "R":
		case "T":
		case "U":
			return "modified";
		default:
			return null;
	}
}

export function parseDiffNameStatus(output: string): GitStatusCounts {
	const result: GitStatusCounts = { new: [], modified: [], deleted: [] };
	for (const line of output.split("\n")) {
		const fields = line.split("\t");
		const status = fields[0];
		if (!status || fields.length < 2) continue;
		const category = categorize(status[0]);
		if (!category) continue;
		const path = fields[fields.length - 1];
		if (path) result[category].push(path);
	}
	return result;
}
