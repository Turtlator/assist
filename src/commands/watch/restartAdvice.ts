const webUiPrefix = "src/commands/sessions/web/ui/";
const sessionsPrefix = "src/commands/sessions/";

const rules = [
	{
		matches: (path: string) => path.startsWith(webUiPrefix),
		advice: "restart the web server, then hard-reload the browser tab",
	},
	{
		matches: (path: string) =>
			path.startsWith(sessionsPrefix) && !path.startsWith(webUiPrefix),
		advice: "restart the daemon",
	},
];

export function restartAdvice(paths: string[]): string[] {
	return rules
		.filter((rule) => paths.some(rule.matches))
		.map((rule) => rule.advice);
}
