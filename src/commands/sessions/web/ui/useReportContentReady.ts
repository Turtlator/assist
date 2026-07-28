import { useLayoutEffect } from "react";
import { useScrollRestorationContext } from "./useScrollRestorationContext";

export function useReportContentReady(ready: boolean) {
	const { reportContentReady } = useScrollRestorationContext();

	useLayoutEffect(() => {
		if (ready) reportContentReady();
	}, [ready, reportContentReady]);
}
