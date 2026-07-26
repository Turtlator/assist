export type ConfigPathSegment =
	| { kind: "key"; name: string }
	| { kind: "entry" }
	| { kind: "index"; index: number }
	| { kind: "item" };

export type ConfigPath = ConfigPathSegment[];

export const RECORD_ENTRY_TOKEN = "*";

function segmentText(segment: ConfigPathSegment): string {
	if (segment.kind === "key") return segment.name;
	if (segment.kind === "entry") return RECORD_ENTRY_TOKEN;
	if (segment.kind === "index") return `[${segment.index}]`;
	return "[]";
}

export function formatConfigPath(path: ConfigPath): string {
	let text = "";
	for (const segment of path) {
		const dotted = segment.kind === "key" || segment.kind === "entry";
		const rendered = segmentText(segment);
		text += dotted && text ? `.${rendered}` : rendered;
	}
	return text;
}
