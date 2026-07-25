import type { PersistedSession } from "./loadPersistedSessions";

const LAUNCH_COMMANDS = ["draft", "feat", "bug", "refine"];

export function needsWrapperRelaunch(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return isBacklogRun(persisted) || isOnceLaunch(persisted);
}

function isBacklogRun(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return (
		persisted.commandType === "assist" &&
		persisted.assistArgs?.[0] === "backlog" &&
		persisted.assistArgs?.[1] === "run"
	);
}

function isOnceLaunch(
	persisted: PersistedSession,
): persisted is PersistedSession & { assistArgs: string[] } {
	return (
		persisted.commandType === "assist" &&
		!!persisted.assistArgs &&
		LAUNCH_COMMANDS.includes(persisted.assistArgs[0]) &&
		persisted.assistArgs.includes("--once")
	);
}
