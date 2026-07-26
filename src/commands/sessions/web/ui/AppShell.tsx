import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { AppRoutes } from "./AppRoutes";
import { AppOverlays } from "./AppOverlays";
import { AppToolbar } from "./AppToolbar";
import { HamburgerMenu } from "./HamburgerMenu";
import { ServerRunLayer } from "./ServerRunLayer";
import { DaemonVersionContext } from "./useDaemonVersionContext";
import { useRepoSelection } from "./useRepoSelection";
import { RepoSelectionContext } from "./useRepoSelectionContext";
import { useSessionLaunch } from "./useSessionLaunch";
import { SessionLaunchContext } from "./useSessionLaunchContext";
import { useSessionSocket } from "./useSessionSocket";
import { useSyncRepoToActiveCard } from "./useSyncRepoToActiveCard";
import { useTopBarLayout } from "./useTopBarLayout";
import { TopBarLayoutContext } from "./useTopBarLayoutContext";

const appBarSx = {
	zIndex: (t: { zIndex: { drawer: number } }) => t.zIndex.drawer + 1,
} as const;
const toolbarSx = { minHeight: 48 } as const;

export function AppShell({
	mode,
	toggle,
}: {
	mode: "light" | "dark";
	toggle: () => void;
}) {
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

	return (
		<TopBarLayoutContext.Provider value={topBar}>
			<RepoSelectionContext.Provider value={selection}>
				<SessionLaunchContext.Provider value={launch}>
					<DaemonVersionContext.Provider value={socket.daemonVersion}>
						<HamburgerMenu mode={mode} toggle={toggle} />
					</DaemonVersionContext.Provider>
					<AppBar position="fixed" elevation={1} sx={appBarSx}>
						<AppToolbar socket={socket} selection={selection} />
					</AppBar>
					<Toolbar variant="dense" sx={toolbarSx} />
					<ServerRunLayer socket={socket}>
						<AppRoutes socket={socket} />
					</ServerRunLayer>
					<AppOverlays
						socket={socket}
						onViewLaunchedSession={viewLaunchedSession}
					/>
				</SessionLaunchContext.Provider>
			</RepoSelectionContext.Provider>
		</TopBarLayoutContext.Provider>
	);
}
