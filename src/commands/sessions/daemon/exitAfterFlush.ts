const FLUSH_TIMEOUT_MS = 2_000;

export function exitAfterFlush(code: number): void {
	let exited = false;
	const exit = (): void => {
		if (exited) return;
		exited = true;
		process.exit(code);
	};
	const timer = setTimeout(exit, FLUSH_TIMEOUT_MS);
	timer.unref();
	process.stdout.write("", () => {
		clearTimeout(timer);
		exit();
	});
}
