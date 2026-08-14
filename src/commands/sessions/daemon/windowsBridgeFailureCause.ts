export const WINDOWS_BRIDGE_FAILURE_PREFIX = "windows bridge unavailable:";

export function windowsBridgeFailureCause(line: string): string | null {
	const index = line.indexOf(WINDOWS_BRIDGE_FAILURE_PREFIX);
	return index === -1 ? null : line.slice(index).trim();
}
