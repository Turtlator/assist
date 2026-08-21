import { spawnSync } from "node:child_process";
import { throwOnGraphqlErrors } from "./throwOnGraphqlErrors";

type GhGraphqlJsonVars = Record<string, unknown>;

export function runGhGraphqlJson(
	query: string,
	vars: GhGraphqlJsonVars = {},
): string {
	const result = spawnSync("gh", ["api", "graphql", "--input", "-"], {
		encoding: "utf8",
		windowsHide: true,
		input: JSON.stringify({ query, variables: vars }),
		maxBuffer: 64 * 1024 * 1024,
	});
	if (result.status !== 0) throw new Error(result.stderr || result.stdout);
	throwOnGraphqlErrors(result.stdout);
	return result.stdout;
}
