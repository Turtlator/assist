export function inWebSession(): boolean {
	return process.env.ASSIST_SESSION === "1" && !!process.env.ASSIST_SESSION_ID;
}
