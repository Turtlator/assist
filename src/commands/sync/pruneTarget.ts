import * as fs from "node:fs";
import * as path from "node:path";

export type PruneResult = {
	orphans: string[];
	removed: string[];
	skipped: { name: string; reason: string }[];
	unmanaged: string[];
};

export type PruneOptions = {
	prune?: boolean;
	force?: boolean;
};

type PruneShape = {
	nameOf: (entry: fs.Dirent) => string | undefined;
	blockedBy?: (entryPath: string) => string | undefined;
};

export function pruneTarget(
	targetDir: string,
	keepNames: Iterable<string>,
	shape: PruneShape,
	options: { force: boolean },
): PruneResult {
	const result: PruneResult = {
		orphans: [],
		removed: [],
		skipped: [],
		unmanaged: [],
	};

	if (!fs.existsSync(targetDir)) return result;

	const keep = new Set(keepNames);

	for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
		const name = shape.nameOf(entry);
		if (name === undefined) {
			result.unmanaged.push(entry.name);
			continue;
		}

		if (keep.has(name)) continue;

		result.orphans.push(entry.name);

		const entryPath = path.join(targetDir, entry.name);
		const reason = shape.blockedBy?.(entryPath);
		if (reason) {
			result.skipped.push({ name: entry.name, reason });
			continue;
		}

		if (options.force) {
			fs.rmSync(entryPath, { recursive: true });
			result.removed.push(entry.name);
		}
	}

	return result;
}
