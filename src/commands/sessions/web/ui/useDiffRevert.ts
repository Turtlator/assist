import { useCallback, useState } from "react";
import { postDiffRevert } from "./postDiffRevert";

export function useDiffRevert(
	cwd: string,
	enabled: boolean,
	refresh: () => void,
): {
	onRevert?: (path: string) => void;
	error: string | null;
	clearError: () => void;
} {
	const [error, setError] = useState<string | null>(null);

	const onRevert = useCallback(
		(path: string) => {
			postDiffRevert(cwd, path)
				.then(refresh)
				.catch((error: unknown) =>
					setError(
						error instanceof Error ? error.message : "Failed to revert file",
					),
				);
		},
		[cwd, refresh],
	);

	return {
		onRevert: enabled ? onRevert : undefined,
		error,
		clearError: () => setError(null),
	};
}
