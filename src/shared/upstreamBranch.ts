import { execSync } from "node:child_process";

export function upstreamBranch(): string | null {
	try {
		const upstream = execSync(
			"git rev-parse --abbrev-ref --symbolic-full-name @{upstream}",
			{ encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
		).trim();
		const slash = upstream.indexOf("/");
		return slash === -1 ? upstream || null : upstream.slice(slash + 1) || null;
	} catch {
		return null;
	}
}
