import { readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const STALE_PATTERN = /^pr-\d+-comments\.yaml$/;

export function removeStaleCommentsCaches(cwd: string = process.cwd()): void {
	const dir = join(cwd, ".assist");
	let entries: string[];
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}
	for (const entry of entries.filter((e) => STALE_PATTERN.test(e))) {
		unlinkSync(join(dir, entry));
	}
}
