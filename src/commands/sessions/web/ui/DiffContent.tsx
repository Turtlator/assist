import { DiffCommentSnackbar } from "./DiffCommentSnackbar";
import { DiffContentBody } from "./DiffContentBody";
import { DiffToolbar } from "./DiffToolbar";
import type { DiffPanelMode } from "./toggleDiffPanel";
import type { SessionInfo } from "./types";
import { useDiffContent } from "./useDiffContent";

export function DiffContent({
	cwd,
	sessionId,
	scope,
	onScopeChange,
	sessions,
	sendInput,
	mode,
	onToggleMode,
	onClose,
}: {
	cwd: string;
	sessionId?: string;
	scope: string;
	onScopeChange: (scope: string) => void;
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
	mode?: DiffPanelMode;
	onToggleMode?: () => void;
	onClose?: () => void;
}) {
	const diff = useDiffContent(cwd, sessionId, scope, sessions, sendInput);

	return (
		<>
			<DiffToolbar
				{...diff.filters}
				{...diff.treePanel}
				scope={diff.scopeState}
				onScopeChange={onScopeChange}
				totals={diff.totals}
				commentHint={diff.comments.unavailable}
				mode={mode}
				onToggleMode={onToggleMode}
				onClose={onClose}
			/>
			<DiffContentBody
				loading={diff.loading}
				files={diff.visibleFiles}
				treeVisible={diff.treePanel.treeVisible}
				viewType={diff.filters.viewType}
				cwd={cwd}
				isCollapsed={diff.collapsedFiles.isCollapsed}
				onToggleCollapsed={diff.collapsedFiles.toggle}
				onComment={diff.comments.onComment}
				emptyMessage={diff.emptyMessage}
			/>
			<DiffCommentSnackbar
				sessionName={diff.comments.sentTo}
				onClose={diff.comments.clearSent}
			/>
		</>
	);
}
