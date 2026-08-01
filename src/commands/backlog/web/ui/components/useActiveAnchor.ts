import { useEffect, useState } from "react";

function scrollParent(el: HTMLElement): HTMLElement | null {
	for (let node = el.parentElement; node; node = node.parentElement) {
		const { overflowY } = getComputedStyle(node);
		if (overflowY === "auto" || overflowY === "scroll") return node;
	}
	return null;
}

export function useActiveAnchor(
	ids: string[],
	stickyOffset: number,
): string | undefined {
	const key = ids.join("|");
	const [activeId, setActiveId] = useState<string | undefined>(ids[0]);

	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return;
		const elements = (key ? key.split("|") : [])
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);
		const [first] = elements;
		if (!first) {
			setActiveId(undefined);
			return;
		}
		const root = scrollParent(first);

		const update = () => {
			const line = (root?.getBoundingClientRect().top ?? 0) + stickyOffset + 1;
			let current = first.id;
			for (const el of elements) {
				if (el.getBoundingClientRect().top <= line) current = el.id;
			}
			setActiveId(current);
		};
		update();

		const observer = new IntersectionObserver(update, {
			root,
			rootMargin: `-${stickyOffset}px 0px 0px 0px`,
			threshold: 0,
		});
		for (const el of elements) observer.observe(el);
		const scroller: HTMLElement | typeof globalThis = root ?? globalThis;
		scroller.addEventListener("scroll", update, { passive: true });
		return () => {
			observer.disconnect();
			scroller.removeEventListener("scroll", update);
		};
	}, [key, stickyOffset]);

	return activeId;
}
