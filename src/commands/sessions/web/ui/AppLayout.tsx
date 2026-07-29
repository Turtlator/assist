import Box from "@mui/material/Box";
import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "./AppSidebar";
import { ErrorBoundary } from "./ErrorBoundary";
import type { SidebarTab } from "./types";
import { useActivateSession } from "./useActivateSession";
import { DiffPanelsProvider } from "./useDiffPanels";
import { useScrollRestoration } from "./useScrollRestoration";
import { ScrollRestorationContext } from "./useScrollRestorationContext";
import type { SessionSocket } from "./useSessionSocket";
import { StarredSessionsProvider } from "./useStarredSessions";

export function AppLayout({ socket }: { socket: SessionSocket }) {
	const [tab, setTab] = useState<SidebarTab>("active");
	const { pathname } = useLocation();
	const { containerRef, restoration } = useScrollRestoration(pathname);
	const { requestHistory, clearTranscript } = socket;
	const activateSession = useActivateSession(socket.selectSession);

	const handleTabChange = useCallback(
		(next: SidebarTab) => {
			if (next === "history") requestHistory();
			else clearTranscript();
			setTab(next);
		},
		[requestHistory, clearTranscript],
	);

	return (
		<StarredSessionsProvider
			sessions={socket.sessions}
			setSessionStarred={socket.setStarred}
		>
			<DiffPanelsProvider onActivateSession={activateSession}>
				<Box
					sx={{ display: "flex", width: "100%", height: "calc(100vh - 48px)" }}
				>
					<AppSidebar socket={socket} tab={tab} onTabChange={handleTabChange} />
					<Box
						ref={containerRef}
						sx={{
							flex: 1,
							minWidth: 0,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							overflow: "auto",
						}}
					>
						<ScrollRestorationContext.Provider value={restoration}>
							<ErrorBoundary key={pathname}>
								<Outlet />
							</ErrorBoundary>
						</ScrollRestorationContext.Provider>
					</Box>
				</Box>
			</DiffPanelsProvider>
		</StarredSessionsProvider>
	);
}
