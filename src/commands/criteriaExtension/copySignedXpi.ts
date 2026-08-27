import { copyFile } from "node:fs/promises";
import { join } from "node:path";

const SIGNED_XPI_NAME = "criteria-extension.xpi";

export async function copySignedXpi(xpi: string, dir: string): Promise<string> {
	const fixed = join(dir, SIGNED_XPI_NAME);
	if (fixed === xpi) return fixed;
	await copyFile(xpi, fixed);
	return fixed;
}
