export async function saveFileContent(
	cwd: string,
	path: string,
	content: string,
): Promise<string> {
	const res = await fetch(
		`/api/file?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		},
	);
	const body = await res.json().catch(() => ({}));
	if (!res.ok)
		throw new Error(
			typeof body.error === "string" ? body.error : "Failed to save file",
		);
	if (typeof body.content !== "string")
		throw new Error("The server returned no file content");
	return body.content;
}
