import { existsSync, statSync } from "node:fs";
import path from "node:path";

export function scopeDirectory(target: string): string {
	const resolved = path.resolve(target);
	return existsSync(resolved) && statSync(resolved).isDirectory()
		? resolved
		: path.dirname(resolved);
}
