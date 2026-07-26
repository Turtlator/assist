import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { AppRoutes } from "./AppRoutes";
import { AppOverlays } from "./AppOverlays";
import { AppToolbar } from "./AppToolbar";
import { HamburgerMenu } from "./HamburgerMenu";
import { ServerRunLayer } from "./ServerRunLayer";
import { useAppShell } from "./useAppShell";
import { DaemonVersionContext } from "./useDaemonVersionContext";
import { RepoSelectionContext } from "./useRepoSelectionContext";
import { SessionLaunchContext } from "./useSessionLaunchContext";
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
	const { socket, selection, launch, viewLaunchedSession, topBar } =
		useAppShell();

	return (
		<TopBarLayoutContext.Provider value={topBar}>
			<RepoSelectionContext.Provider value={selection}>
				<SessionLaunchContext.Provider value={launch}>
					<DaemonVersionContext.Provider value={socket.daemonVersion}>
						<HamburgerMenu
							mode={mode}
							toggle={toggle}
							reconnecting={socket.reconnecting}
						/>
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
