import type { VttCue } from "../types";

function pad(value: number, width: number): string {
	return String(value).padStart(width, "0");
}

function formatTimestamp(ms: number): string {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms % 1000, 3)}`;
}

function formatCue(cue: VttCue): string {
	const timing = `${formatTimestamp(cue.startMs)} --> ${formatTimestamp(cue.endMs)}`;
	const text = cue.speaker ? `<v ${cue.speaker}>${cue.text}` : cue.text;
	return `${timing}\n${text}`;
}

export function formatVtt(cues: VttCue[]): string {
	return ["WEBVTT", ...cues.map(formatCue)].join("\n\n");
}
