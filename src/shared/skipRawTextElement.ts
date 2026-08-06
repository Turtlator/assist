const RAW_TEXT_TAGS = ["script", "style"];
const TAG_NAME_END = /[^A-Za-z0-9-]/;

function openedTag(content: string, tagStart: number, tagEnd: number): string {
	if (content.slice(tagStart, tagEnd).endsWith("/>")) return "";
	const name = content.slice(tagStart + 1, tagEnd).toLowerCase();
	return (
		RAW_TEXT_TAGS.find(
			(tag) =>
				name.startsWith(tag) && TAG_NAME_END.test(name[tag.length] ?? ">"),
		) ?? ""
	);
}

export function skipRawTextElement(
	content: string,
	tagStart: number,
	tagEnd: number,
): number {
	const tag = openedTag(content, tagStart, tagEnd);
	if (!tag) return tagEnd;

	const close = new RegExp(`</${tag}`, "i").exec(content.slice(tagEnd));
	return close ? tagEnd + close.index : tagEnd;
}
