import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	closeDiffPanel,
	type DiffPanel,
	type DiffPanelMap,
	type DiffPanelTarget,
	setDiffPanelScope,
	toggleDiffPanel,
	toggleDiffPanelMode,
} from "./toggleDiffPanel";

type DiffPanels = {
	panelFor: (sessionId: string | null) => DiffPanel | undefined;
	togglePanel: (sessionId: string, target: DiffPanelTarget) => void;
	closePanel: (sessionId: string) => void;
	setPanelScope: (sessionId: string, scope: string) => void;
	togglePanelMode: (sessionId: string) => void;
};

const DiffPanelsContext = createContext<DiffPanels | null>(null);

export function DiffPanelsProvider({
	onActivateSession,
	children,
}: {
	onActivateSession: (sessionId: string) => void;
	children: ReactNode;
}) {
	const [panels, setPanels] = useState<DiffPanelMap>({});

	const togglePanel = useCallback(
		(sessionId: string, target: DiffPanelTarget) => {
			onActivateSession(sessionId);
			setPanels((current) => toggleDiffPanel(current, sessionId, target));
		},
		[onActivateSession],
	);

	const value = useMemo(
		() => ({
			panelFor: (sessionId: string | null) =>
				sessionId === null ? undefined : panels[sessionId],
			togglePanel,
			closePanel: (sessionId: string) =>
				setPanels((current) => closeDiffPanel(current, sessionId)),
			setPanelScope: (sessionId: string, scope: string) =>
				setPanels((current) => setDiffPanelScope(current, sessionId, scope)),
			togglePanelMode: (sessionId: string) =>
				setPanels((current) => toggleDiffPanelMode(current, sessionId)),
		}),
		[panels, togglePanel],
	);

	return (
		<DiffPanelsContext.Provider value={value}>
			{children}
		</DiffPanelsContext.Provider>
	);
}

export function useDiffPanels(): DiffPanels {
	const context = useContext(DiffPanelsContext);
	if (!context) {
		throw new Error("useDiffPanels must be used within a DiffPanelsProvider");
	}
	return context;
}
