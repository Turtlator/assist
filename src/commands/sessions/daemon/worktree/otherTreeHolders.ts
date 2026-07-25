import type { Session } from "../createSession";
import { treeUnderClose } from "./treeUnderClose";

export function otherTreeHolders(
	sessions: Map<string, Session>,
	session: Session,
): Session[] {
	const tree = treeUnderClose(session)?.path;
	if (!tree) return [];
	return [...sessions.values()].filter(
		(s) => s.id !== session.id && treeUnderClose(s)?.path === tree,
	);
}
