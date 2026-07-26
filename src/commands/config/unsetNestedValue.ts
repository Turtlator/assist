type Container = Record<string, unknown> | unknown[];

type UnsetResult = {
	config: Record<string, unknown>;
	removed: boolean;
};

type Removal = { container: Container; removed: boolean };

function isPlainObject(val: unknown): val is Record<string, unknown> {
	return val !== null && typeof val === "object" && !Array.isArray(val);
}

function isContainer(val: unknown): val is Container {
	return Array.isArray(val) || isPlainObject(val);
}

function isNumericKey(key: string): boolean {
	return /^\d+$/.test(key);
}

function toIndex(key: string): number {
	return Number.parseInt(key, 10);
}

function hasKey(container: Container, key: string): boolean {
	if (Array.isArray(container)) {
		return isNumericKey(key) && toIndex(key) < container.length;
	}
	return Object.hasOwn(container, key);
}

function getItem(container: Container, key: string): unknown {
	if (Array.isArray(container)) return container[toIndex(key)];
	return container[key];
}

function withoutKey(container: Container, key: string): Container {
	if (Array.isArray(container)) {
		const next = [...container];
		next.splice(toIndex(key), 1);
		return next;
	}
	const { [key]: _deleted, ...rest } = container;
	return rest;
}

function withChild(
	container: Container,
	key: string,
	child: Container,
): Container {
	if (Array.isArray(container)) {
		const next = [...container];
		next[toIndex(key)] = child;
		return next;
	}
	return { ...container, [key]: child };
}

function isPrunable(container: Container): boolean {
	return isPlainObject(container) && Object.keys(container).length === 0;
}

function replaceOrPrune(
	container: Container,
	key: string,
	child: Container,
): Container {
	return isPrunable(child)
		? withoutKey(container, key)
		: withChild(container, key, child);
}

function removeFromChild(
	container: Container,
	key: string,
	rest: string[],
): Removal {
	const child = getItem(container, key);
	if (!isContainer(child)) return { container, removed: false };

	const inner = removeAt(child, rest);
	if (!inner.removed) return { container, removed: false };
	return {
		container: replaceOrPrune(container, key, inner.container),
		removed: true,
	};
}

function removeAt(container: Container, keys: string[]): Removal {
	const [key, ...rest] = keys;
	if (!hasKey(container, key)) return { container, removed: false };
	if (rest.length === 0) {
		return { container: withoutKey(container, key), removed: true };
	}
	return removeFromChild(container, key, rest);
}

export function unsetNestedValue(
	obj: Record<string, unknown>,
	path: string,
): UnsetResult {
	const { container, removed } = removeAt(obj, path.split("."));
	return { config: container as Record<string, unknown>, removed };
}
