import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function findPortFile(roamDir: string): string | undefined {
	let entries: string[];
	try {
		entries = readdirSync(roamDir);
	} catch {
		return undefined;
	}

	const candidates = entries
		.filter((name) => /^roam-local-api(-[^.]+)?\.port$/.test(name))
		.map((name) => {
			const path = join(roamDir, name);
			try {
				return { path, mtimeMs: statSync(path).mtimeMs };
			} catch {
				return undefined;
			}
		})
		.filter((c): c is { path: string; mtimeMs: number } => c !== undefined)
		.sort((a, b) => b.mtimeMs - a.mtimeMs);

	return candidates[0]?.path;
}

const PID_BY_APP: Record<string, number> = {
	"claude-code": 99999,
	codex: 99998,
	pi: 99997,
};

export function postRoamActivity(app: string, event: string): void {
	const appData = process.env.APPDATA;
	if (!appData) return;

	const portFile = findPortFile(join(appData, "Roam"));
	if (!portFile) return;

	let port: string;
	try {
		port = readFileSync(portFile, "utf8").trim();
	} catch {
		return;
	}

	const pid = PID_BY_APP[app] ?? 99999;
	const url = `http://127.0.0.1:${port}/api/v1/activity/${app}/${event}?pid=${pid}`;

	try {
		execFileSync("curl", ["-sf", "--max-time", "0.2", "-X", "POST", url], {
			stdio: "ignore",
		});
	} catch {
		// Silently fail — Roam may not be running
	}
}
