import * as path from "node:path";
import { type PruneResult, pruneTarget } from "./pruneTarget";

export function pruneCommands(
	targetDir: string,
	commandNames: Iterable<string>,
	options: { force: boolean },
): PruneResult {
	return pruneTarget(
		targetDir,
		commandNames,
		{
			nameOf: (entry) =>
				entry.isFile() && entry.name.endsWith(".md")
					? path.basename(entry.name, ".md")
					: undefined,
		},
		options,
	);
}
