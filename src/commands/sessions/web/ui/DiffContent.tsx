import { DiffCommentSnackbar } from "./DiffCommentSnackbar";
import { DiffToolbar } from "./DiffToolbar";
import { DiffViewBody } from "./DiffViewBody";
import { PageSpinner } from "./PageSpinner";
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
	const {
		scopeState,
		loading,
		filters,
		treePanel,
		comments,
		visibleFiles,
		emptyMessage,
	} = useDiffContent(cwd, sessionId, scope, sessions, sendInput);

	return (
		<>
			<DiffToolbar
				{...filters}
				{...treePanel}
				scope={scopeState}
				onScopeChange={onScopeChange}
				commentHint={comments.unavailable}
				mode={mode}
				onToggleMode={onToggleMode}
				onClose={onClose}
			/>
			{loading ? (
				<PageSpinner />
			) : (
				<DiffViewBody
					files={visibleFiles}
					treeVisible={treePanel.treeVisible}
					viewType={filters.viewType}
					cwd={cwd}
					onComment={comments.onComment}
					emptyMessage={emptyMessage}
				/>
			)}
			<DiffCommentSnackbar
				sessionName={comments.sentTo}
				onClose={comments.clearSent}
			/>
		</>
	);
}
