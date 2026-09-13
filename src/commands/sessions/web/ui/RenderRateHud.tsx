import { type CSSProperties, useEffect, useRef } from "react";
import { renderCounters, renderHudEnabled } from "./renderCounters";
import { formatRenderRates, sampleRenderRates } from "./sampleRenderRates";

const SAMPLE_MS = 500;

const hudStyle: CSSProperties = {
	position: "fixed",
	bottom: 8,
	right: 8,
	zIndex: 3000,
	background: "rgba(0, 0, 0, 0.8)",
	color: "#7cfc9a",
	font: "11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace",
	padding: "6px 8px",
	borderRadius: 4,
	whiteSpace: "pre",
	cursor: "pointer",
};

export function RenderRateHud() {
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!renderHudEnabled) return;
		let previous = new Map(renderCounters);
		let sampledAt = performance.now();
		let frame = requestAnimationFrame(function tick() {
			frame = requestAnimationFrame(tick);
			const now = performance.now();
			if (now - sampledAt < SAMPLE_MS) return;
			const rates = sampleRenderRates(
				renderCounters,
				previous,
				now - sampledAt,
			);
			previous = new Map(renderCounters);
			sampledAt = now;
			if (ref.current) ref.current.textContent = formatRenderRates(rates);
		});
		return () => cancelAnimationFrame(frame);
	}, []);

	if (!renderHudEnabled) return null;

	return (
		<div
			ref={ref}
			style={hudStyle}
			onClick={() => renderCounters.clear()}
			onKeyDown={() => renderCounters.clear()}
		/>
	);
}
