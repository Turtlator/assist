import {
	type ConfigPath,
	type ConfigPathSegment,
	RECORD_ENTRY_TOKEN,
} from "./formatConfigPath";

const INDEX = /^\d+$/;

function bracketSegment(inner: string): ConfigPathSegment | undefined {
	if (inner === "") return { kind: "item" };
	return INDEX.test(inner)
		? { kind: "index", index: Number(inner) }
		: undefined;
}

function nameSegment(name: string): ConfigPathSegment {
	return name === RECORD_ENTRY_TOKEN
		? { kind: "entry" }
		: { kind: "key", name };
}

export function parseConfigPath(text: string): ConfigPath | undefined {
	const path: ConfigPath = [];
	let at = 0;
	while (at < text.length) {
		if (text[at] === "[") {
			const close = text.indexOf("]", at);
			const segment =
				close === -1 ? undefined : bracketSegment(text.slice(at + 1, close));
			if (!segment) return undefined;
			path.push(segment);
			at = close + 1;
			continue;
		}
		if (text[at] === ".") {
			if (path.length === 0) return undefined;
			at += 1;
		}
		const start = at;
		while (at < text.length && text[at] !== "." && text[at] !== "[") at += 1;
		const name = text.slice(start, at);
		if (!name) return undefined;
		path.push(nameSegment(name));
	}
	return path;
}
