const RAZOR_EXTENSIONS = [".razor", ".cshtml"];

export function isRazorFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	return RAZOR_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
