type ResolvedRepoUnsetTarget = {
	key: string | undefined;
	useRepo: boolean;
	repoName: string | undefined;
};

export function resolveRepoUnsetTarget(
	key: string | undefined,
	repo: boolean | string | undefined,
): ResolvedRepoUnsetTarget {
	if (typeof repo === "string") {
		if (key === undefined)
			return { key: repo, useRepo: true, repoName: undefined };
		return { key, useRepo: true, repoName: repo };
	}
	return { key, useRepo: repo === true, repoName: undefined };
}
