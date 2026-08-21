import type { MiroRawItem } from "./types";

export type MiroSource = {
	board?: string;
	frame?: string;
};

function boardId(url: string | undefined): string | undefined {
	return url ? /\/board\/([^/?]+)/.exec(url)?.[1] : undefined;
}

export function miroSource(items: MiroRawItem[], anchorId: string): MiroSource {
	const anchor = items.find((item) => item.id === anchorId);
	const ordered = anchor ? [anchor, ...items] : items;
	return {
		board: boardId(ordered.find((item) => item.miro_url)?.miro_url),
		frame: ordered.find((item) => item.parent?.id)?.parent?.id,
	};
}
