import { postConfigWrite } from "./postConfigWrite";
import type { ConfigScope } from "./saveConfigValue";

type UnsetConfigValueRequest = {
	key: string;
	cwd: string;
	scope: ConfigScope;
};

export async function unsetConfigValue(
	request: UnsetConfigValueRequest,
): Promise<{ error?: string }> {
	return postConfigWrite(
		"/api/config/unset",
		request,
		"Failed to clear config",
	);
}
