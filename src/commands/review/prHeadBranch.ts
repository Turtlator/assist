import { execFileSync } from "node:child_process";

export function prHeadBranch(number: string): string | null {
	try {
		const out = execFileSync(
			"gh",
			["pr", "view", number, "--json", "headRefName", "-q", ".headRefName"],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		).trim();
		return out || null;
	} catch {
		return null;
	}
}
