import { loadConfig } from "../../../shared/loadConfig";

const DEFAULT_MAX_LIVE = 24;

export function maxLiveSessions(): number {
	return loadConfig().sessions?.maxLive ?? DEFAULT_MAX_LIVE;
}
