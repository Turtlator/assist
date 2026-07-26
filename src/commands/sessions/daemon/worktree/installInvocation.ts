export function installInvocation(
	worktreePath: string,
	command: string,
): [
	string,
	string[],
	{ cwd: string; detached: boolean; stdio: ["ignore", "ignore", "pipe"] },
] {
	const windows = /^[A-Za-z]:[\\/]/.test(worktreePath);
	const shell = windows ? "cmd.exe" : (process.env.SHELL ?? "bash");
	const args = windows
		? ["/c", `cd /d ${quoteForCmd(worktreePath)} && ${command}`]
		: ["-l", "-c", `cd ${quoteForPosixShell(worktreePath)} && ${command}`];
	return [
		shell,
		args,
		{ cwd: worktreePath, detached: true, stdio: ["ignore", "ignore", "pipe"] },
	];
}

function quoteForCmd(value: string): string {
	return `"${value.replaceAll('"', "")}"`;
}

function quoteForPosixShell(value: string): string {
	return `'${value.replaceAll("'", `'\\''`)}'`;
}
