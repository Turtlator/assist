import {
	type CommitAnchor,
	findCommitAnchor,
} from "../../../shared/db/findCommitAnchor";
import { findItemBySessionId } from "../../../shared/db/findItemBySessionId";
import { getDb } from "../../../shared/db/getDb";
import { loadConfig } from "../../../shared/loadConfig";

const EMPTY_TTL_MS = 30_000;

const cache = new Map<string, { anchor: CommitAnchor; expiresAt: number }>();
const inFlight = new Map<string, Promise<CommitAnchor>>();

export async function sessionCommitAnchor(
	sessionId: string,
): Promise<CommitAnchor> {
	const cached = cache.get(sessionId);
	if (cached && cached.expiresAt > Date.now()) return cached.anchor;

	const pending = inFlight.get(sessionId);
	if (pending) return pending;

	const lookup = loadAnchor(sessionId).finally(() =>
		inFlight.delete(sessionId),
	);
	inFlight.set(sessionId, lookup);
	return lookup;
}

async function loadAnchor(sessionId: string): Promise<CommitAnchor> {
	const anchor = await queryAnchor(sessionId);
	const found = Boolean(anchor.commit || anchor.parent);
	cache.set(sessionId, {
		anchor,
		expiresAt: found ? Number.POSITIVE_INFINITY : Date.now() + EMPTY_TTL_MS,
	});
	return anchor;
}

async function queryAnchor(sessionId: string): Promise<CommitAnchor> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url)
			return {};
		const db = await getDb();
		const itemId = await findItemBySessionId(db, sessionId);
		if (itemId === undefined) return {};
		return await findCommitAnchor(db, itemId);
	} catch {
		return {};
	}
}
