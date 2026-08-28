import { spawnSync } from "node:child_process";

const SCOPES_LINE = /Token scopes:\s*(.*)/;

export function readGhTokenScopes(): string[] | undefined {
	const result = spawnSync("gh", ["auth", "status"], {
		encoding: "utf8",
		windowsHide: true,
	});
	const match = SCOPES_LINE.exec(
		`${result.stdout ?? ""}\n${result.stderr ?? ""}`,
	);
	if (!match) return undefined;
	return (match[1] ?? "")
		.split(",")
		.map((scope) => scope.trim().replace(/^'|'$/g, ""))
		.filter((scope) => scope.length > 0);
}
