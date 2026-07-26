import { useEffect, useState } from "react";

export function useSessionViewConfig(): { floatWaiting: boolean } {
	const [floatWaiting, setFloatWaiting] = useState(false);

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			try {
				const res = await fetch("/api/session-view");
				const body = await res.json();
				if (!cancelled) setFloatWaiting(Boolean(body?.floatWaiting));
			} catch {
				setFloatWaiting(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	return { floatWaiting };
}
