const ITEM_ID = /^a?\d+$/;

export function isBacklogRunArgs(args: string[]): boolean {
	const [command, subcommand, ...rest] = args;
	if (command !== "backlog" || subcommand !== "run") return false;
	return rest.some((arg) => ITEM_ID.test(arg));
}
