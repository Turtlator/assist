import { useSearchParams } from "react-router";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function useDiffTarget(): { cwd: string; sessionId?: string } {
	const [searchParams] = useSearchParams();
	const { selectedCwd } = useRepoSelectionContext();
	return {
		cwd: searchParams.get("cwd") || selectedCwd,
		sessionId: searchParams.get("session") ?? undefined,
	};
}
