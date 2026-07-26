export function starredThenWaitingFirst<T>(
	items: T[],
	isStarred: (item: T) => boolean,
	isFloatingWaiter: (item: T) => boolean,
): T[] {
	return [
		...items.filter(isStarred),
		...items.filter((item) => !isStarred(item) && isFloatingWaiter(item)),
		...items.filter((item) => !isStarred(item) && !isFloatingWaiter(item)),
	];
}
