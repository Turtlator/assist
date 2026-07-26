import { useRepoSelection } from "./useRepoSelection";
import { useSessionLaunch } from "./useSessionLaunch";
import { useSessionSocket } from "./useSessionSocket";
import { useSyncRepoToActiveCard } from "./useSyncRepoToActiveCard";
import { useTopBarLayout } from "./useTopBarLayout";

export function useAppShell() {
	const socket = useSessionSocket();
	const selection = useRepoSelection(socket.currentCwd, socket.history);
	useSyncRepoToActiveCard(
		socket.activeId,
		socket.sessions,
		socket.history,
		selection.setSelectedCwd,
	);
	const { launch, viewLaunchedSession } = useSessionLaunch(socket);
	const topBar = useTopBarLayout();

	return { socket, selection, launch, viewLaunchedSession, topBar };
}
