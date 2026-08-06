const CSHARP_EXTENSIONS = [".cs", ".csx"];

export function isCsharpFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	return CSHARP_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
