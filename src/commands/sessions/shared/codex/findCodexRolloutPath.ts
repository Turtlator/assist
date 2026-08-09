import * as path from "node:path";
import { discoverCodexRolloutPaths } from "./discoverCodexRolloutPaths";

export async function findCodexRolloutPath(
	sessionId: string,
): Promise<string | null> {
	if (!sessionId) return null;
	const paths = await discoverCodexRolloutPaths();
	const suffix = `-${sessionId}.jsonl`;
	return paths.find((file) => path.basename(file).endsWith(suffix)) ?? null;
}
