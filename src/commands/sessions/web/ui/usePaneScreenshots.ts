import { useScreenshots } from "./useScreenshots";
import { useScreenshotUpload } from "./useScreenshotUpload";

export function usePaneScreenshots(cwd: string | undefined, enabled: boolean) {
	const { screenshots, add, remove } = useScreenshots();
	const { uploads, onDrop, onDragOver } = useScreenshotUpload(
		cwd,
		add,
		enabled,
	);

	return {
		screenshots,
		removeScreenshot: remove,
		uploads,
		onDrop,
		onDragOver,
	};
}
