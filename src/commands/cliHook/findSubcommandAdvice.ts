/**
 * Read commands that have focused sub-commands producing targeted output.
 * When wrapped in a compound command (e.g. piped through grep/sed), the hook
 * denies with an advisory message steering the caller to a bare sub-command
 * instead, rather than letting it fall through to a permission prompt.
 */
type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

const SUBCOMMAND_READS: { prefix: string; subcommands: string[] }[] = [
	{
		prefix: "assist complexity",
		subcommands: ["maintainability", "cyclomatic", "halstead"],
	},
];

/**
 * When a command has multiple parts (compound) and one is a read command with
 * focused sub-commands, deny with advice to run the bare sub-command directly.
 */
export function findSubcommandAdvice(
	parts: string[],
): HookDecision | undefined {
	if (parts.length <= 1) return undefined;

	for (const part of parts) {
		const rule = matchesSubcommandRead(part);
		if (rule) {
			return {
				permissionDecision: "deny",
				permissionDecisionReason: `Do not pipe or chain '${rule.prefix}'. Run a focused sub-command directly for targeted output: ${rule.subcommands
					.map((s) => `${rule.prefix} ${s} <file>`)
					.join(", ")}.`,
			};
		}
	}

	return undefined;
}

function matchesSubcommandRead(part: string) {
	return SUBCOMMAND_READS.find(
		(rule) => part === rule.prefix || part.startsWith(`${rule.prefix} `),
	);
}
