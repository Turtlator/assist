export function lineCounter(content: string): (offset: number) => number {
	let scanned = 0;
	let line = 1;
	return (offset) => {
		for (; scanned < offset; scanned++) {
			if (content[scanned] === "\n") line++;
		}
		return line;
	};
}
