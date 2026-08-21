import {
	type OriginResolution,
	resolveCurrentOrigin,
} from "../../backlog/getCurrentOrigin";

const cache = new Map<string, string>();

// why: only stable resolutions are cached, so anything already in the map was stable when it went in
export function originResolutionForCwd(
	cwd: string | undefined,
): OriginResolution | undefined {
	if (!cwd) return undefined;
	const cached = cache.get(cwd);
	if (cached !== undefined) return { origin: cached, stable: true };
	const resolved = resolveCurrentOrigin(cwd);
	if (resolved.stable) cache.set(cwd, resolved.origin);
	return resolved;
}

export function originForCwd(cwd: string | undefined): string | undefined {
	return originResolutionForCwd(cwd)?.origin;
}
