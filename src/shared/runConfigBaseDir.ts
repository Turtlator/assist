import { findRepoRoot } from "./findRepoRoot";
import { findConfigUp } from "./loadConfigFrom";

export function runConfigBaseDirFrom(cwd: string): string {
	return findConfigUp(cwd)?.rootDir ?? findRepoRoot(cwd) ?? cwd;
}

export function runConfigBaseDir(): string {
	return runConfigBaseDirFrom(process.cwd());
}
