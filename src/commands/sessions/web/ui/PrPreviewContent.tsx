import { AcceptanceCriteriaOutline } from "./AcceptanceCriteriaOutline";
import { PreviewBody } from "./PreviewBody";
import { ScreenshotsSection } from "./ScreenshotsSection";
import type { usePrPane } from "./usePrPane";

export function PrPreviewContent({
	pane,
	screenshots,
}: {
	pane: ReturnType<typeof usePrPane>;
	screenshots: boolean;
}) {
	const criteria = pane.criteria;
	const parts = criteria
		? {
				content: criteria.before.join("\n"),
				trailing: criteria.after.join("\n"),
				control: (
					<AcceptanceCriteriaOutline
						items={criteria.items}
						onChange={pane.onCriteriaChange}
					/>
				),
			}
		: { content: pane.body };

	return (
		<PreviewBody
			{...parts}
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
