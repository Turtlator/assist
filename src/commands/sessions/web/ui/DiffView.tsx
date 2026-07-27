import { useState } from "react";
import { parseDiff, type ViewType } from "react-diff-view";
import { diffCommentSender } from "./diffCommentSender";
import { DiffFileList } from "./DiffFileList";
import { diffEmptyMessage } from "./diffEmptyMessage";
import { DiffToolbar } from "./DiffToolbar";
import { type DiffChangeType, filterDiffFiles } from "./filterDiffFiles";
import { PageShell } from "./PageShell";
import { PageSpinner } from "./PageSpinner";
import type { SessionInfo } from "./types";
import { useDiff } from "./useDiff";
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
	const [viewType, setViewType] = useState<ViewType>("split");
	const [search, setSearch] = useState("");
	const [changeType, setChangeType] = useState<DiffChangeType>("all");

	const files = error || !diff ? [] : parseDiff(diff);
	const onComment = diffCommentSender(sessions, sessionId, sendInput);

	return (
		<PageShell maxWidth={false}>
			<DiffToolbar
				viewType={viewType}
				onChange={setViewType}
				search={search}
				onSearchChange={setSearch}
				changeType={changeType}
				onChangeTypeChange={setChangeType}
				scope={scopeState}
				onScopeChange={setScope}
			/>
			{loading ? (
				<PageSpinner />
			) : (
				<DiffFileList
					files={filterDiffFiles(files, { query: search, changeType })}
					viewType={viewType}
					cwd={cwd}
					onComment={onComment}
					emptyMessage={diffEmptyMessage(error, files.length)}
				/>
			)}
		</PageShell>
	);
}
