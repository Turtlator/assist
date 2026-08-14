import { isPidAlive, readDaemonPidFile } from "./readDaemonPidFile";

export function describeWedgedHolder(): string {
	const recorded = readDaemonPidFile();
	if (
		recorded !== undefined &&
		recorded !== process.pid &&
		isPidAlive(recorded)
	)
		return `daemon.pid records PID ${recorded}, which is still alive — kill PID ${recorded} to free the pipe and the windows bridge port`;
	return "the holding process could not be identified — look for a stray assist daemon and kill it";
}
