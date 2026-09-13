import { useLocation } from "react-router";

export function useRouteDeselectsSession(): boolean {
	const { pathname } = useLocation();
	return pathname.startsWith("/backlog") || pathname.startsWith("/usage");
}
