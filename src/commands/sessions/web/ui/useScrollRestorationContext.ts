import { createContext, useContext } from "react";

export type ScrollRestoration = {
	reportContentReady: () => void;
};

export const ScrollRestorationContext = createContext<ScrollRestoration>({
	reportContentReady: () => {},
});

export function useScrollRestorationContext(): ScrollRestoration {
	return useContext(ScrollRestorationContext);
}
