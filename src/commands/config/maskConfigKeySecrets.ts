import { maskConfigSecrets } from "../../shared/maskConfigSecrets";
import { configKeyNode } from "./configKeyNode";

export function maskConfigKeySecrets(key: string, value: unknown): unknown {
	return maskConfigSecrets(value, configKeyNode(key));
}
