import { useState } from "react";
import type { PrSummary } from "../prList";
import { prLaunchMeta } from "./prLaunchMeta";
import {
	type ReviewChain,
	reviewChainArgs,
	reviewChainDefaults,
} from "./ReviewChainToggles";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

export function useReviewLaunch(
	cwd: string,
	pr: PrSummary,
	launchedFrom?: string,
): {
	chain: ReviewChain;
	setChain: (chain: ReviewChain) => void;
	resetChain: () => void;
	launchMode: (modeArgs: string[]) => void;
	launchAddressComments: () => void;
} {
	const { launchAssist } = useSessionLaunchContext();
	const [chain, setChain] = useState(reviewChainDefaults);
	const meta = { ...prLaunchMeta(pr), inPlace: true, launchedFrom };
	const launch = (args: string[]) => launchAssist(args, cwd, meta);

	return {
		chain,
		setChain,
		resetChain: () => setChain(reviewChainDefaults),
		launchMode: (modeArgs) =>
			launch([...modeArgs, String(pr.number), ...reviewChainArgs(chain)]),
		launchAddressComments: () =>
			launch(["review-pr-comments", String(pr.number)]),
	};
}
