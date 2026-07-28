import type { SessionInfo } from "./types";

export type NestedSessionRow = {
	session: SessionInfo;
	children: SessionInfo[];
};

export function nestUnderBacklogRun(
	sessions: SessionInfo[],
): NestedSessionRow[] {
	const runByTree = new Map<string, SessionInfo>();
	for (const session of sessions) {
		const tree = nestableTree(session);
		if (!tree || !isBacklogRun(session) || runByTree.has(tree)) continue;
		runByTree.set(tree, session);
	}

	const rowByRun = new Map<SessionInfo, NestedSessionRow>();
	for (const run of runByTree.values()) {
		rowByRun.set(run, { session: run, children: [] });
	}

	const rows: NestedSessionRow[] = [];
	for (const session of sessions) {
		const ownRow = rowByRun.get(session);
		if (ownRow) {
			rows.push(ownRow);
			continue;
		}
		const parentRow = isBacklogRun(session)
			? undefined
			: parentRowFor(session, runByTree, rowByRun);
		if (parentRow) parentRow.children.push(session);
		else rows.push({ session, children: [] });
	}
	return rows;
}

function parentRowFor(
	session: SessionInfo,
	runByTree: Map<string, SessionInfo>,
	rowByRun: Map<SessionInfo, NestedSessionRow>,
): NestedSessionRow | undefined {
	const tree = nestableTree(session);
	const run = tree ? runByTree.get(tree) : undefined;
	return run ? rowByRun.get(run) : undefined;
}

function isBacklogRun(session: SessionInfo): boolean {
	return session.activity?.kind === "backlog";
}

function nestableTree(session: SessionInfo): string | undefined {
	const { cwd, repoGroup } = session;
	if (!cwd || !repoGroup || repoGroup.clone === cwd) return undefined;
	return cwd;
}
