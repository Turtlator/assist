const ANSI = new RegExp(
	`${String.fromCharCode(27)}\\[[0-9;?]*[ -/]*[@-~]`,
	"g",
);

export function stripAnsi(text: string): string {
	return text.replace(ANSI, "");
}
