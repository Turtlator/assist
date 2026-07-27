import { parseDiff } from "react-diff-view";
import { DiffCommentSnackbar } from "./DiffCommentSnackbar";
import { DiffFileList } from "./DiffFileList";
import { diffEmptyMessage } from "./diffEmptyMessage";
import { DiffToolbar } from "./DiffToolbar";
import { filterDiffFiles } from "./filterDiffFiles";
import { PageShell } from "./PageShell";
import { PageSpinner } from "./PageSpinner";
import type { SessionInfo } from "./types";
import { useDiff } from "./useDiff";
import { useDiffComments } from "./useDiffComments";
import { useDiffFilters } from "./useDiffFilters";
import { useDiffScopeState } from "./useDiffScopeState";
import { useDiffTarget } from "./useDiffTarget";

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
	const { onComment, unavailable, sentTo, clearSent } = useDiffComments(
		sessions,
		sessionId,
		sendInput,
	);

	const files = error || !diff ? [] : parseDiff(diff);

	return (
		<PageShell maxWidth={false}>
			<DiffToolbar
				{...filters}
				scope={scopeState}
				onScopeChange={setScope}
				commentHint={unavailable}
			/>
			{loading ? (
				<PageSpinner />
			) : (
				<DiffFileList
					files={filterDiffFiles(files, {
						query: filters.search,
						changeType: filters.changeType,
					})}
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
