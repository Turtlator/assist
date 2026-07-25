import type { Interface } from "node:readline";

export function readDaemonMessage<T>(
	lines: Interface,
	timeoutMs: number,
	fallback: T,
	match: (data: Record<string, unknown>) => T | undefined,
): Promise<T> {
	return new Promise((resolve) => {
		const finish = (value: T) => {
			clearTimeout(timer);
			lines.off("line", onLine);
			resolve(value);
		};
		const timer = setTimeout(() => finish(fallback), timeoutMs);
		const onLine = (line: string) => {
			try {
				const matched = match(JSON.parse(line));
				if (matched !== undefined) finish(matched);
			} catch {}
		};
		lines.on("line", onLine);
	});
}
