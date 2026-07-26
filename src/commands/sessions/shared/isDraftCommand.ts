const DRAFT_COMMANDS = ["draft", "bug", "refine"];

export function isDraftCommand(command: string | undefined): boolean {
	return command != null && DRAFT_COMMANDS.includes(command);
}
