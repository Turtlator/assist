import { realpathSync } from "node:fs";
import { resolve } from "node:path";

export function canonicalTreePath(path: string): string {
	try {
		return realpathSync(path);
	} catch {
		return resolve(path);
	}
}
