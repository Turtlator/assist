const TRACKER_HOSTS = ["github.com", "atlassian.net", "slack.com"];
const ISSUE_KEY = /^[A-Z][A-Z0-9]+-\d+$/;
const HASH_NUMBER = /^#\d+$/;
const ASSIST_ITEM_ID = /^a[0-9a-f]{2,}$/;

export function isReferenceOnlyPrompt(prompt: string): boolean {
	const tokens = prompt.trim().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return false;
	return tokens.every(isReference);
}

function isReference(token: string): boolean {
	return (
		isTrackerUrl(token) ||
		ISSUE_KEY.test(token) ||
		HASH_NUMBER.test(token) ||
		ASSIST_ITEM_ID.test(token)
	);
}

function isTrackerUrl(token: string): boolean {
	let host: string;
	try {
		const url = new URL(token);
		if (url.protocol !== "http:" && url.protocol !== "https:") return false;
		host = url.hostname.toLowerCase();
	} catch {
		return false;
	}
	return TRACKER_HOSTS.some(
		(tracker) => host === tracker || host.endsWith(`.${tracker}`),
	);
}
