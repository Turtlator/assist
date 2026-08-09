import type { HistoricalSession } from "../parseSessionFile";
import { discoverCodexRolloutPaths } from "./discoverCodexRolloutPaths";
import { parseCodexSessionFile } from "./parseCodexSessionFile";

export async function discoverCodexSessions(): Promise<HistoricalSession[]> {
	const paths = await discoverCodexRolloutPaths();
	const parsed = await Promise.all(paths.map(parseCodexSessionFile));
	return parsed.filter((session) => session !== null);
}
