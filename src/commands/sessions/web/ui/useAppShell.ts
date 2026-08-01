import { useRepoSelection } from "./useRepoSelection";
import { useSessionLaunch } from "./useSessionLaunch";
import { useSessionSocket } from "./useSessionSocket";
import { useTopBarLayout } from "./useTopBarLayout";

export function useAppShell() {
	const socket = useSessionSocket();
	const selection = useRepoSelection(
		socket.currentCwd,
		socket.history,
		socket.activeId,
		socket.sessions,
	);
	const { launch, viewLaunchedSession } = useSessionLaunch(socket);
	const topBar = useTopBarLayout();

	return { socket, selection, launch, viewLaunchedSession, topBar };
}
