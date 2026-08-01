import type { DiffViewBodyProps } from "./DiffViewBody";
import type { useDiffContent } from "./useDiffContent";

export function diffBodyProps(
	diff: ReturnType<typeof useDiffContent>,
	cwd: string,
): DiffViewBodyProps & { loading: boolean } {
	return {
		loading: diff.loading,
		files: diff.visibleFiles,
		treeVisible: diff.treePanel.treeVisible,
		activeFile: diff.activeFile,
		viewType: diff.filters.viewType,
		cwd,
		isCollapsed: diff.collapsedFiles.isCollapsed,
		onToggleCollapsed: diff.collapsedFiles.toggle,
		onComment: diff.comments.onComment,
		onRevert: diff.revert.onRevert,
		emptyMessage: diff.emptyMessage,
	};
}
