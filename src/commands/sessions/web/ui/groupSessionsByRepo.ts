import { repoGroupCwd, repoGroupKey } from "./repoGroupKey";
import { repoLabel } from "./repoLabel";
import type { SessionInfo } from "./types";
import { starredThenWaitingFirst } from "./starredThenWaitingFirst";

type SessionGroup =
	| { kind: "single"; session: SessionInfo }
	| { kind: "repo"; key: string; label: string; sessions: SessionInfo[] };

const never = () => false;

export function groupSessionsByRepo(
	sessions: SessionInfo[],
	isStarred: (session: SessionInfo) => boolean,
	isFloatingWaiter: (session: SessionInfo) => boolean = never,
): SessionGroup[] {
	const order: string[] = [];
	const buckets = new Map<string, SessionInfo[]>();
	const labels = new Map<string, string>();

	sessions.forEach((session, index) => {
		const ungroupedKey = ` nogroup:${index}`;
		const key = repoGroupKey(session) ?? ungroupedKey;
		const existing = buckets.get(key);
		if (existing) {
			existing.push(session);
		} else {
			order.push(key);
			buckets.set(key, [session]);
			labels.set(key, repoLabel(repoGroupCwd(session) ?? key));
		}
	});

	const groups: SessionGroup[] = [];
	for (const key of order) {
		const members = buckets.get(key)!;
		if (members.length < 2) {
			groups.push({ kind: "single", session: members[0]! });
			continue;
		}
		groups.push({
			kind: "repo",
			key,
			label: labels.get(key)!,
			sessions: starredThenWaitingFirst(members, isStarred, isFloatingWaiter),
		});
	}
	return starredThenWaitingFirst(
		groups,
		(group) => groupMembers(group).some(isStarred),
		(group) => groupMembers(group).some(isFloatingWaiter),
	);
}

function groupMembers(group: SessionGroup): SessionInfo[] {
	return group.kind === "repo" ? group.sessions : [group.session];
}
