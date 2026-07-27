const ESC = String.fromCharCode(27);
const PASTE_START = `${ESC}[200~`;
const PASTE_END = `${ESC}[201~`;

export function bracketedPasteSubmit(text: string): string {
	return `${PASTE_START}${text.replace(/\r?\n/g, "\r")}${PASTE_END}\r`;
}
