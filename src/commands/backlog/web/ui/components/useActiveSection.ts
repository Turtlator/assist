import { STICKY_PINNED_HEADER_HEIGHT } from "./itemSectionAnchor";
import { useActiveAnchor } from "./useActiveAnchor";

export function useActiveSection(ids: string[]): string | undefined {
	return useActiveAnchor(ids, STICKY_PINNED_HEADER_HEIGHT);
}
