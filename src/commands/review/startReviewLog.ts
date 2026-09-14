import { format } from "node:util";
import { createReviewLogSink } from "./createReviewLogSink";

const sink = createReviewLogSink();
let patched = false;

export function appendReviewLog(line: string): void {
	sink.append(line);
}

export function attachReviewLog(reviewDir: string): void {
	sink.attach(reviewDir);
}

function patch(method: "log" | "error" | "warn"): void {
	const original = console[method].bind(console);
	console[method] = (...args: unknown[]): void => {
		original(...args);
		appendReviewLog(format(...args));
	};
}

export function startReviewLog(): void {
	if (patched) return;
	patched = true;
	patch("log");
	patch("error");
	patch("warn");
}
