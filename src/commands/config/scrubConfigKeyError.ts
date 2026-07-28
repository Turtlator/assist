import { scrubConfigSecrets } from "../../shared/scrubConfigSecrets";
import { configKeyNode } from "./configKeyNode";

export function scrubConfigKeyError(
	error: string,
	key: string,
	value: unknown,
): string {
	return scrubConfigSecrets([error], value, configKeyNode(key))[0];
}
