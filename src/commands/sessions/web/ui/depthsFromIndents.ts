const TAB_WIDTH = 4;

export function indentWidth(lead: string): number {
	let width = 0;
	for (const char of lead) width += char === "\t" ? TAB_WIDTH : 1;
	return width;
}

export function depthsFromIndents(widths: number[]): number[] {
	const open: number[] = [];
	return widths.map((width) => {
		while (open.length > 0 && width < open[open.length - 1]) open.pop();
		if (open.length === 0 || width > open[open.length - 1]) open.push(width);
		return open.length - 1;
	});
}
