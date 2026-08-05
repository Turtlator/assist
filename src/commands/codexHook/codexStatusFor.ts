type CodexStatusReport = {
	status: "running" | "waiting";
	source: string;
};

export function codexStatusFor(
	event: string,
	autoDecided: boolean,
): CodexStatusReport | undefined {
	if (event === "UserPromptSubmit")
		return { status: "running", source: "prompt" };
	if (event === "PreToolUse") return { status: "running", source: "pretool" };
	if (event === "PostToolUse") return { status: "running", source: "posttool" };
	if (event === "Stop") return { status: "waiting", source: "stop" };
	if (event !== "PermissionRequest") return undefined;
	return autoDecided
		? { status: "running", source: "permission" }
		: { status: "waiting", source: "permission" };
}
