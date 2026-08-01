import { diffEmptyMessage } from "./diffEmptyMessage";
import { diffFileTotals } from "./diffFileTotals";
import { filePath } from "./FileDiff";
import type { SessionInfo } from "./types";
import { useActiveDiffFile } from "./useActiveDiffFile";
import { useCollapsedFiles } from "./useCollapsedFiles";
import { useDiff } from "./useDiff";
import { useDiffComments } from "./useDiffComments";
import { useDiffFileData } from "./useDiffFileData";
import { useDiffFilters } from "./useDiffFilters";
import { useDiffScopeState } from "./useDiffScopeState";
import { useDiffTreePanel } from "./useDiffTreePanel";

export function useDiffContent(
	cwd: string,
	sessionId: string | undefined,
	scope: string,
	sessions: SessionInfo[],
	sendInput: (sessionId: string, data: string) => void,
) {
	const scopeState = useDiffScopeState(cwd, sessionId, scope);
	const { diff, loading, error } = useDiff(cwd, sessionId, scopeState.scope);
	const filters = useDiffFilters();
	const treePanel = useDiffTreePanel();
	const comments = useDiffComments(sessions, sessionId, sendInput);
	const collapsedFiles = useCollapsedFiles(cwd);
	const { files, visibleFiles } = useDiffFileData({
		diff,
		error,
		search: filters.search,
		changeType: filters.changeType,
	});

	const visiblePaths = visibleFiles.map((file) => filePath(file));
	const activeFile = useActiveDiffFile(
		treePanel.treeVisible ? visiblePaths : [],
	);
	const allCollapsed =
		visiblePaths.length > 0 &&
		visiblePaths.every((path) => collapsedFiles.isCollapsed(path));

	return {
		scopeState,
		loading,
		filters,
		treePanel,
		comments,
		collapsedFiles,
		activeFile,
		collapseAll: {
			allCollapsed,
			onToggleCollapseAll: () =>
				collapsedFiles.setAll(visiblePaths, !allCollapsed),
		},
		visibleFiles,
		totals: diffFileTotals(visibleFiles),
		emptyMessage: diffEmptyMessage(error, files.length),
	};
}
