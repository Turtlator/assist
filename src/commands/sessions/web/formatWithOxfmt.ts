import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const TIMEOUT_MS = 15_000;

function findOxfmtScript(root: string): string | undefined {
	let dir = root;
	for (;;) {
		const candidate = join(dir, "node_modules", "oxfmt", "bin", "oxfmt");
		if (existsSync(candidate)) return candidate;
		const parent = dirname(dir);
		if (parent === dir) return undefined;
		dir = parent;
	}
}

export async function formatWithOxfmt(
	target: string,
	root: string,
): Promise<void> {
	const script = findOxfmtScript(root);
	if (!script) return;
	await execFileAsync(process.execPath, [script, target], {
		cwd: root,
		windowsHide: true,
		timeout: TIMEOUT_MS,
	}).catch(() => {});
}
