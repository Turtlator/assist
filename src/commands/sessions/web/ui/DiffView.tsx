import { DiffCommentSnackbar } from "./DiffCommentSnackbar";
import { diffEmptyMessage } from "./diffEmptyMessage";
import { DiffToolbar } from "./DiffToolbar";
import { DiffViewBody } from "./DiffViewBody";
import { PageShell } from "./PageShell";
import { PageSpinner } from "./PageSpinner";
import type { SessionInfo } from "./types";
import { useDiff } from "./useDiff";
import { useDiffComments } from "./useDiffComments";
import { useDiffFileData } from "./useDiffFileData";
import { useDiffFilters } from "./useDiffFilters";
import { useDiffScopeState } from "./useDiffScopeState";
import { useDiffTarget } from "./useDiffTarget";
import { useDiffTreePanel } from "./useDiffTreePanel";

export function DiffView({
	sessions,
	sendInput,
}: {
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
}) {
	const { cwd, sessionId, scope, setScope } = useDiffTarget();
	const scopeState = useDiffScopeState(cwd, sessionId, scope);
	const { diff, loading, error } = useDiff(cwd, sessionId, scopeState.scope);
	const filters = useDiffFilters();
	const treePanel = useDiffTreePanel();
	const { onComment, unavailable, sentTo, clearSent } = useDiffComments(
		sessions,
		sessionId,
		sendInput,
	);

	const { files, visibleFiles } = useDiffFileData({
		diff,
		error,
		search: filters.search,
		changeType: filters.changeType,
	});

	return (
		<PageShell maxWidth={false}>
			<DiffToolbar
				{...filters}
				{...treePanel}
				scope={scopeState}
				onScopeChange={setScope}
				commentHint={unavailable}
			/>
			{loading ? (
				<PageSpinner />
			) : (
				<DiffViewBody
					files={visibleFiles}
					treeVisible={treePanel.treeVisible}
					viewType={filters.viewType}
					cwd={cwd}
					onComment={onComment}
					emptyMessage={diffEmptyMessage(error, files.length)}
				/>
			)}
			<DiffCommentSnackbar sessionName={sentTo} onClose={clearSent} />
		</PageShell>
	);
}
