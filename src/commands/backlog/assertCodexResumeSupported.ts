import type { BacklogRunOptions } from "./types";

export function assertCodexResumeSupported(options?: BacklogRunOptions): void {
	if (options?.resumeSessionId && options.harness === "codex") {
		throw new Error("Codex backlog sessions cannot be resumed yet");
	}
}
