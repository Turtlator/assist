import { useEffect, useRef } from "react";

export function useMarkdownBlockDebug(content: string, segments: unknown) {
	const renders = useRef(0);
	const lastContent = useRef(content);
	const lastSegments = useRef(segments);
	renders.current += 1;

	const contentChanged = lastContent.current !== content;
	const segmentsChanged = lastSegments.current !== segments;
	lastContent.current = content;
	lastSegments.current = segments;

	console.info(
		"[linkdebug] MarkdownBlock render",
		renders.current,
		"contentIdentityChanged:",
		contentChanged,
		"segmentsIdentityChanged:",
		segmentsChanged,
		"@",
		performance.now().toFixed(0),
	);

	useEffect(() => {
		console.warn("[linkdebug] MarkdownBlock MOUNT");
		return () => console.warn("[linkdebug] MarkdownBlock UNMOUNT");
	}, []);
}
