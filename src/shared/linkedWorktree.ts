import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

type LinkedWorktree = { root: string; clone: string };

export function linkedWorktree(dir: string): LinkedWorktree | null {
	const root = findGitLink(dir);
	if (!root) return null;
	const gitDir = readGitDirPointer(root);
	if (!gitDir) return null;
	const commonDir = resolveCommonDir(gitDir);
	if (!commonDir || basename(commonDir) !== ".git") return null;
	const clone = dirname(commonDir);
	return existsSync(clone) ? { root, clone } : null;
}

function findGitLink(dir: string): string | null {
	let current = resolve(dir);
	while (current !== dirname(current)) {
		const entry = join(current, ".git");
		if (existsSync(entry)) return isFile(entry) ? current : null;
		current = dirname(current);
	}
	return null;
}

function isFile(path: string): boolean {
	try {
		return statSync(path).isFile();
	} catch {
		return false;
	}
}

function readGitDirPointer(root: string): string | null {
	const target = readTrimmed(join(root, ".git"));
	if (!target?.startsWith("gitdir:")) return null;
	return absolute(target.slice("gitdir:".length).trim(), root);
}

function resolveCommonDir(gitDir: string): string | null {
	const recorded = readTrimmed(join(gitDir, "commondir"));
	if (recorded) return absolute(recorded, gitDir);
	return linkedGitDirParent(gitDir);
}

function linkedGitDirParent(gitDir: string): string | null {
	const match = /^(.*)[/\\]worktrees[/\\][^/\\]+[/\\]?$/.exec(gitDir);
	return match ? match[1] : null;
}

function readTrimmed(path: string): string | null {
	try {
		const content = readFileSync(path, "utf8").trim();
		return content === "" ? null : content;
	} catch {
		return null;
	}
}

function absolute(target: string, from: string): string {
	return isAbsolute(target) ? target : resolve(from, target);
}
