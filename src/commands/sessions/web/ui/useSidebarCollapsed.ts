import { useState } from "react";
import { loadPersisted, savePersisted } from "./loadPersisted";
import type { SidebarCollapse } from "./useSidebarCollapsedContext";

const KEY = "assist:sidebar-collapsed";

export function useSidebarCollapsed(): SidebarCollapse {
	const [collapsed, setCollapsed] = useState(
		() => loadPersisted<true>(KEY).length > 0,
	);

	return {
		collapsed,
		onToggleCollapsed: () => {
			const next = !collapsed;
			savePersisted(KEY, next ? [true] : []);
			setCollapsed(next);
		},
	};
}
