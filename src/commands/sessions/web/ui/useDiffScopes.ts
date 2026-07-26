import { useEffect, useState } from "react";
import type { CommitRef } from "../../../../shared/db/listCommitRefs";
import { diffQuery } from "./diffQuery";

export function useDiffScopes(cwd: string, sessionId?: string): CommitRef[] {
	const [commits, setCommits] = useState<CommitRef[]>([]);

	useEffect(() => {
		if (!cwd || !sessionId) {
			setCommits([]);
			return;
		}
		let cancelled = false;
		const load = async () => {
			try {
				const res = await fetch(
					`/api/diff-scopes?${diffQuery(cwd, sessionId)}`,
				);
				const body = await res.json();
				if (!cancelled) setCommits(body?.commits ?? []);
			} catch {
				if (!cancelled) setCommits([]);
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [cwd, sessionId]);

	return commits;
}
