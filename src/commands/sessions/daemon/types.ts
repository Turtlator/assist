import type { FSWatcher } from "node:fs";
import type { Activity } from "../../../shared/emitActivity";
import type { HarnessKind } from "../../../shared/harnesses";
import type {
	CommandType,
	PrPreview,
	SessionInfoBase,
} from "../shared/SessionInfoBase";
import type { spawnClaude } from "./spawnClaude";

export type SessionStatus =
	| "running"
	| "waiting"
	| "done"
	| "error"
	| "stopped";

export type OnStatusChange = (
	session: Session,
	status: SessionStatus,
	exitCode?: number,
) => void;

export type Session = {
	id: string;
	name: string;
	title?: string;
	subtitle?: string;
	commandType: CommandType;
	harness?: HarnessKind;
	status: SessionStatus;
	startedAt: number;
	runningMs: number;
	runningSince: number | null;
	pty: ReturnType<typeof spawnClaude> | null;
	scrollback: string;
	runName?: string;
	runArgs?: string[];
	assistArgs?: string[];
	server?: boolean;
	serverPort?: number;
	serverOrigin?: string;
	stopping?: boolean;
	cwd?: string;
	claudeSessionId?: string;
	initialPrompt?: string;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	activityWatcher?: FSWatcher;
	transcriptWatcher?: FSWatcher;
	gitWatcher?: FSWatcher;
	watchedTranscriptId?: string;
	worktree?: { path: string; clone: string };
	undurable?: { reason: string };
	transcriptPath?: string;
	permissionActive?: boolean;
	autoRun?: boolean;
	autoAdvance?: boolean;
	starred?: boolean;
	design?: boolean;
	reviewStarted?: boolean;
	usageSeeded?: boolean;
	pendingPrPreview?: PrPreview;
	pendingRestart?: () => void;
	pendingDismiss?: () => void;
	cols?: number;
	rows?: number;
	usedPct?: number;
	activeMsFlushedForStretch?: { since: number; ms: number };
	activeMsFlushChain?: Promise<void>;
};

export type SessionInfo = SessionInfoBase & {
	status: string;
	runningMs: number;
	runningSince: number | null;
	runArgs?: string[];
};
