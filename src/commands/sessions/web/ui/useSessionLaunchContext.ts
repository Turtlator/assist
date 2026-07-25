import { createContext, useContext } from "react";
import type { AssistLaunchMeta } from "./createSessionAction";

type SessionLaunch = {
	launchAssist: (
		assistArgs: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
	launchAgentInStream: (
		joinSessionId: string,
		prompt: string,
		cwd?: string,
	) => void;
	armUpdateReload: () => void;
};

export const SessionLaunchContext = createContext<SessionLaunch>({
	launchAssist: () => {},
	launchAgentInStream: () => {},
	armUpdateReload: () => {},
});

export function useSessionLaunchContext(): SessionLaunch {
	return useContext(SessionLaunchContext);
}
