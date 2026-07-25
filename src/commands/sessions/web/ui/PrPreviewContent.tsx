import { PreviewBody } from "./PreviewBody";
import { ScreenshotsSection } from "./ScreenshotsSection";
import type { usePrPane } from "./usePrPane";

export function PrPreviewContent({
	body,
	pane,
	screenshots,
}: {
	body: string;
	pane: ReturnType<typeof usePrPane>;
	screenshots: boolean;
}) {
	return (
		<PreviewBody
			content={body}
			ranges={pane.ranges}
			wrapperRef={pane.wrapperRef}
			contentRef={pane.contentRef}
			dragRects={pane.dragRects}
			dragColor={pane.dragColor}
			onMouseDown={pane.onMouseDown}
			footer={
				screenshots ? (
					<ScreenshotsSection
						screenshots={pane.screenshots}
						uploads={pane.uploads}
						onRemove={pane.removeScreenshot}
					/>
				) : undefined
			}
		/>
	);
}
