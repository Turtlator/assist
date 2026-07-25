import { Route, Routes } from "react-router";
import { LiveSessionsContext } from "../../../sessions/web/ui/useLiveSessionsContext";
import type { SessionSocket } from "../../../sessions/web/ui/useSessionSocket";
import { ViewRouter } from "./components/ViewRouter";
import { useBacklogItems } from "./useBacklogItems";

export function BacklogView({ socket }: { socket: SessionSocket }) {
	const { items, loading, reload } = useBacklogItems();

	return (
		<LiveSessionsContext.Provider value={socket.sessions}>
			<Routes>
				<Route
					path="/*"
					element={
						<ViewRouter
							items={items}
							loading={loading}
							socket={socket}
							onReload={reload}
						/>
					}
				/>
			</Routes>
		</LiveSessionsContext.Provider>
	);
}
