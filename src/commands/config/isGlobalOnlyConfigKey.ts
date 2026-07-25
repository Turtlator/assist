const GLOBAL_ONLY_KEYS = ["sync.autoConfirm"];

export function isGlobalOnlyConfigKey(key: string): boolean {
	return GLOBAL_ONLY_KEYS.some((k) => key.startsWith(k));
}
