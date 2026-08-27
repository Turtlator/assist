import { existsSync } from "node:fs";
import { join } from "node:path";

const KEY_URL = "https://addons.mozilla.org/en-US/developers/addon/api/key/";

type SignProblem = { message: string; hint: string };

export function signPreflightProblem(source: string): SignProblem | null {
	if (!existsSync(join(source, "content.js")))
		return {
			message: `no content.js in ${source}`,
			hint: "run npm run build to bundle the content script",
		};
	if (!(process.env.WEB_EXT_API_KEY && process.env.WEB_EXT_API_SECRET))
		return {
			message: "WEB_EXT_API_KEY and WEB_EXT_API_SECRET are not both set",
			hint: `create an AMO API key at ${KEY_URL}`,
		};
	return null;
}
