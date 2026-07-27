import { useState } from "react";
import { parseDiff, type ViewType } from "react-diff-view";
import { diffCommentSender } from "./diffCommentSender";
import { DiffFileList } from "./DiffFileList";
import { DiffToolbar } from "./DiffToolbar";
import { type DiffChangeType, filterDiffFiles } from "./filterDiffFiles";
import { PageShell } from "./PageShell";
import type { SessionInfo } from "./types";
import { useDiff } from "./useDiff";
import { useDiffScopes } from "./useDiffScopes";
import { useDiffTarget } from "./useDiffTarget";

export function DiffView({
	sessions,
	sendInput,
}: {
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
}) {
	const { cwd, sessionId, scope, setScope } = useDiffTarget();
	const { diff, loading, error } = useDiff(cwd, sessionId, scope);
	const scopeCommits = useDiffScopes(cwd, sessionId);
	const [viewType, setViewType] = useState<ViewType>("split");
	const [search, setSearch] = useState("");
	const [changeType, setChangeType] = useState<DiffChangeType>("all");

	const files = error || !diff ? [] : parseDiff(diff);
	const onComment = diffCommentSender(sessions, sessionId, sendInput);

	return (
		<PageShell
			loading={loading}
			isEmpty={files.length === 0}
			emptyMessage={error ? "Failed to load diff." : "No working-tree changes."}
			maxWidth={false}
		>
			<DiffToolbar
				viewType={viewType}
				onChange={setViewType}
				search={search}
				onSearchChange={setSearch}
				changeType={changeType}
				onChangeTypeChange={setChangeType}
				scope={scope}
				scopeCommits={scopeCommits}
				onScopeChange={setScope}
			/>
			<DiffFileList
				files={filterDiffFiles(files, { query: search, changeType })}
				viewType={viewType}
				cwd={cwd}
				onComment={onComment}
			/>
		</PageShell>
	);
}
