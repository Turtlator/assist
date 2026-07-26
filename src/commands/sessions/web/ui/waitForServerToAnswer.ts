const POLL_INTERVAL_MS = 300;
const PROBE_URL = "/api/session-layout";

async function serverAnswers(): Promise<boolean> {
	try {
		const res = await fetch(PROBE_URL, { cache: "no-store" });
		return res.ok;
	} catch {
		return false;
	}
}

export async function waitForServerToAnswer(
	abandoned: () => boolean,
): Promise<boolean> {
	while (!abandoned()) {
		if (await serverAnswers()) return !abandoned();
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}
	return false;
}
