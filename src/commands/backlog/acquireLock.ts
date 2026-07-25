import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function getLocksDir(): string {
	return join(homedir(), ".assist", "locks");
}

function getLockPath(itemId: number): string {
	return join(getLocksDir(), `lock-${itemId}.json`);
}

function isProcessAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

export type LockHolder = { pid: number; timestamp?: string };

export function foreignLockHolder(itemId: number): LockHolder | null {
	const lockPath = getLockPath(itemId);
	if (!existsSync(lockPath)) return null;

	try {
		const lock = JSON.parse(readFileSync(lockPath, "utf8"));
		if (typeof lock.pid !== "number" || lock.pid === process.pid) return null;
		if (!isProcessAlive(lock.pid)) return null;
		return { pid: lock.pid, timestamp: lock.timestamp };
	} catch {
		return null;
	}
}

export function isLockedByOther(itemId: number): boolean {
	return foreignLockHolder(itemId) !== null;
}

export function acquireLock(itemId: number): void {
	mkdirSync(getLocksDir(), { recursive: true });
	writeFileSync(
		getLockPath(itemId),
		JSON.stringify({ pid: process.pid, timestamp: new Date().toISOString() }),
	);
}

export function releaseLock(itemId: number): void {
	const lockPath = getLockPath(itemId);
	try {
		unlinkSync(lockPath);
	} catch {
		// Lock file may already be removed
	}
}
