import type { Command } from "commander";
import { add as backlogAdd } from "./add";
import { addPhase as backlogAddPhase } from "./addPhase";
import { list as backlogList } from "./list";
import { propose as backlogPropose } from "./propose";

export function registerItemCommands(cmd: Command): void {
	cmd
		.command("list")
		.alias("ls")
		.description("List all backlog items")
		.option(
			"--status <type>",
			"Filter by status (todo, in-progress, done, wontdo)",
		)
		.option("-a, --all", "Include done/wontdo items")
		.option("--all-repos", "List items across all repositories")
		.option("-v, --verbose", "Show all item details")
		.action(backlogList);

	cmd
		.command("add")
		.description("Add a new backlog item")
		.option("--name <name>", "Item name")
		.option("--type <type>", "Item type (story or bug)")
		.option(
			"--desc <description>",
			String.raw`Item description (Markdown supported; use \n for line breaks)`,
		)
		.option("--ac <criterion...>", "Acceptance criteria (repeatable)")
		.action(backlogAdd);

	cmd
		.command("propose")
		.description(
			"Preview a complete backlog item for approval, then create it on approval",
		)
		.requiredOption(
			"--json <file|->",
			"Path to a JSON payload describing the item, or - to read it from stdin",
		)
		.option(
			"--confirmed",
			"Create the item after its draft has been reviewed in chat (agent use outside a web session)",
		)
		.action(backlogPropose);

	cmd
		.command("add-phase <id> <name>")
		.description("Add a phase to an existing backlog item")
		.option("--task <task...>", "Task description (repeatable)")
		.option(
			"--manual-check <check...>",
			"Manual check description (repeatable)",
		)
		.option(
			"--position <position>",
			"1-indexed position to insert at (default: append)",
		)
		.action(backlogAddPhase);
}
