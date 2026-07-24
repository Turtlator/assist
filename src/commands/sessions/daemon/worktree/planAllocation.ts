import { basename, join } from "node:path";

export function planAllocation(
	clone: string,
	boundTreeRoots: Set<string>,
): "primary" | "spill" {
	return boundTreeRoots.has(clone) ? "spill" : "primary";
}

export function nextWorktreePath(
	clone: string,
	base: string,
	isTaken: (path: string) => boolean,
): string {
	const name = basename(clone);
	for (let n = 2; n < 1000; n++) {
		const candidate = join(base, `${name}-${n}`);
		if (!isTaken(candidate)) return candidate;
	}
	throw new Error(`no free worktree suffix for ${clone}`);
}
