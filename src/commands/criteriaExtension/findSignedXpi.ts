import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export async function findSignedXpi(dir: string): Promise<string | null> {
	if (!existsSync(dir)) return null;
	const name = (await readdir(dir)).find((entry) => entry.endsWith(".xpi"));
	return name ? join(dir, name) : null;
}
