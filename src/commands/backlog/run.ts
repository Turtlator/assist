import chalk from "chalk";
import { withoutResumeSession } from "../../shared/spawnClaude";
import { acquireLock, foreignLockHolder, releaseLock } from "./acquireLock";
import { ensureStoryBranch } from "./ensureStoryBranch";
import { formatItemId, parseItemId } from "./formatItemId";
import { handleReviewResult } from "./handleReviewResult";
import { type PreparedRun, prepareRun } from "./prepareRun";
import { reportDuplicateRun } from "./reportDuplicateRun";
import { runOnce } from "./runOnce";
import { setStatus } from "./shared";
import type { BacklogRunOptions } from "./types";
import { clearSignalOwner } from "./recordSignalOwner";
import { discardStalePause } from "./discardStalePause";

export async function run(
	id: string,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const itemId = parseItemId(id);
	const holder = foreignLockHolder(itemId);
	if (holder) {
		reportDuplicateRun(itemId, holder);
		return false;
	}
	acquireLock(itemId);
	try {
		return await runLocked(id, spawnOptions);
	} finally {
		releaseLock(itemId);
	}
}

async function runLocked(
	id: string,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const prepared = await prepareRun(id, spawnOptions?.resumeSessionId);
	if (!prepared) return false;

	await ensureStoryBranch(prepared.item);
	await setStatus(id, "in-progress");
	discardStalePause(prepared.item.id);
	logProgress(prepared);
	return runPrepared(id, prepared, spawnOptions);
}

async function runPrepared(
	id: string,
	prepared: PreparedRun,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const { item } = prepared;
	let { plan, startPhase } = prepared;
	try {
		while (true) {
			const review = await runOnce(item, startPhase, plan, spawnOptions);
			spawnOptions = withoutResumeSession(spawnOptions);
			const outcome = await handleReviewResult(id, review);
			if (outcome.kind === "stop") {
				return outcome.success;
			}
			startPhase = outcome.startPhase;
			plan = outcome.plan;
		}
	} finally {
		clearSignalOwner(item.id);
	}
}

function logProgress({ plan, startPhase, item }: PreparedRun): void {
	console.log(
		chalk.bold(`Running plan for ${formatItemId(item.id)}: ${item.name}`),
	);
	// why: +1 for the review phase appended after the authored phases, so resuming at the review reads e.g. 2/2 rather than 2/1.
	const totalPhases = plan.length + 1;
	if (startPhase > 0) {
		const phaseNumber = startPhase + 1;
		console.log(
			chalk.dim(`Resuming from phase ${phaseNumber}/${totalPhases}\n`),
		);
	} else {
		console.log(chalk.dim(`${totalPhases} phase(s)\n`));
	}
}
