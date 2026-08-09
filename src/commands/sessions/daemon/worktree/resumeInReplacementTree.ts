import { existsSync } from "node:fs";
import type { HarnessKind } from "../../../../shared/harnesses";
import { daemonLog } from "../daemonLog";
import { resumeSession } from "../resumeSession";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { carryTranscriptToTree } from "./carryTranscriptToTree";
import { worktreeAttributionIncludingReaped } from "./readWorktreeRegistry";

export function resumeInReplacementTree(
	ctx: TreeSpawnContext,
	claudeSessionId: string,
	missingCwd: string,
	name: string | undefined,
	harness?: HarnessKind,
): string {
	const clone = cloneForReapedTree(missingCwd);
	daemonLog(
		`resuming ${claudeSessionId}: its tree ${missingCwd} is gone, allocating from clone ${clone}`,
	);
	return allocateAndBind(
		ctx,
		clone,
		(id, resolvedCwd, holdUntilSeeded) => {
			const cwd = resolvedCwd ?? clone;
			carryTranscriptToTree(claudeSessionId, missingCwd, cwd);
			daemonLog(`session ${id} resuming ${claudeSessionId} in ${cwd}`);
			return resumeSession(
				id,
				claudeSessionId,
				cwd,
				name,
				holdUntilSeeded,
				harness,
			);
		},
		{ replacesTree: missingCwd },
	);
}

function cloneForReapedTree(missingCwd: string): string {
	const clone = worktreeAttributionIncludingReaped(missingCwd)?.clone;
	if (!clone || !existsSync(clone))
		throw new Error(
			`working directory no longer exists and no clone is recorded to re-allocate from: ${missingCwd}`,
		);
	return clone;
}
