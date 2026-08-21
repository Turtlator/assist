import { isAbsolute, relative, resolve } from "node:path";
import { findConfigUp } from "../../shared/loadConfigFrom";

function extractRoot(cwd: string): string {
	return findConfigUp(cwd)?.rootDir ?? cwd;
}

export function resolveExtractPath(value: string, cwd: string): string;
export function resolveExtractPath(
	value: string | undefined,
	cwd: string,
): string | undefined;
export function resolveExtractPath(
	value: string | undefined,
	cwd: string,
): string | undefined {
	if (value === undefined) return undefined;
	return isAbsolute(value) ? value : resolve(extractRoot(cwd), value);
}

export function storedExtractPath(value: string, cwd: string): string;
export function storedExtractPath(
	value: string | undefined,
	cwd: string,
): string | undefined;
export function storedExtractPath(
	value: string | undefined,
	cwd: string,
): string | undefined {
	if (value === undefined) return undefined;
	const absolute = resolve(cwd, value);
	const within = relative(extractRoot(cwd), absolute);
	return within.startsWith("..") ? absolute : within;
}
