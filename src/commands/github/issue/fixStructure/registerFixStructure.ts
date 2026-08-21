import type { Command } from "commander";
import { fixStructure } from "./fixStructure";
import { defaultTypeChain } from "./types";

const chain = defaultTypeChain.join(" > ");
const levels = defaultTypeChain.map((name) => name.toLowerCase()).join("|");

export function registerFixStructure(issueCommand: Command): void {
	issueCommand
		.command("fix-structure <target>")
		.description("Normalise the issue types across one issue subtree")
		.option(
			"-R, --repo <owner/repo>",
			"Repository a bare issue number belongs to",
		)
		.option(
			"--level <level>",
			`The target's own position in the ${chain} chain, when it cannot be inferred from its type`,
		)
		.option("--apply", "Write the planned changes instead of reporting them")
		.addHelpText(
			"after",
			`\nWalks the subtree reachable from <target> via sub-issues and reports the type each issue should carry: every level below the target is typed to the next level down the ${chain} chain. Nothing outside the subtree is ever read or written.\nThe target's own level is inferred from its issue type, so aiming at a story types its children as subtasks. When the target's type is not in the chain the level cannot be inferred, and --level ${levels} asserts it instead — which also plans the target's own type.\nThe target is owner/repo#number, a github.com issue URL, or a bare number with --repo.\nWithout --apply nothing is written. With --apply each write is announced before it is issued, and the subtree is re-walked afterwards so any residual drift fails the run.\nAnything nested below the leaf level fails the run before a single write, naming the offender and its parent.`,
		)
		.action(fixStructure);
}
