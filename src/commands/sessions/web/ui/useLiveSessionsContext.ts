import { createContext, useContext } from "react";
import type { SessionInfo } from "./types";

export const LiveSessionsContext = createContext<SessionInfo[]>([]);

export function useLiveSessionsContext(): SessionInfo[] {
	return useContext(LiveSessionsContext);
}
