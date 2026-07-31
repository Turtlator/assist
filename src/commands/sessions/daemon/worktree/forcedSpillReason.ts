export function forcedSpillReason(
	clone: string,
	trunk: boolean,
	options: { replacesTree?: string; commits?: boolean },
): string | undefined {
	if (options.replacesTree)
		return `resumed session spilled out of the clone ${clone}: its worktree ${options.replacesTree} is gone`;
	if (trunk === true && options.commits === true)
		return `committing session spilled out of the clone ${clone}: worktree.trunk is on, so a commit here would land on the local mainline`;
	return undefined;
}
