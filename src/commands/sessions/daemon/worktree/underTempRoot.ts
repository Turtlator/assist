import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { sep } from "node:path";

function tempRoots(): string[] {
	const raw = tmpdir();
	const roots = new Set([raw]);
	try {
		roots.add(realpathSync(raw));
	} catch {
		return [...roots];
	}
	return [...roots];
}

export function underTempRoot(path: string): boolean {
	return tempRoots().some((root) =>
		path.startsWith(root.endsWith(sep) ? root : root + sep),
	);
}
