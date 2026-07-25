import { useEffect, useState } from "react";

type FileContentState =
	| { status: "loading" }
	| { status: "absent" }
	| { status: "error" }
	| { status: "ready"; content: string };

export function useFileContent(
	cwd: string | undefined,
	path: string,
): FileContentState {
	const [state, setState] = useState<FileContentState>({ status: "loading" });

	useEffect(() => {
		if (!cwd) {
			setState({ status: "error" });
			return;
		}
		let cancelled = false;
		setState({ status: "loading" });
		const load = async () => {
			try {
				const res = await fetch(
					`/api/file?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`,
				);
				if (cancelled) return;
				if (res.status === 404) {
					setState({ status: "absent" });
					return;
				}
				if (!res.ok) {
					setState({ status: "error" });
					return;
				}
				const body = await res.json();
				if (cancelled) return;
				if (typeof body.content !== "string") {
					setState({ status: "error" });
					return;
				}
				setState({ status: "ready", content: body.content });
			} catch {
				if (!cancelled) setState({ status: "error" });
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [cwd, path]);

	return state;
}
