import { useScreenshots } from "./useScreenshots";
import { useScreenshotUpload } from "./useScreenshotUpload";

export function usePaneScreenshots(cwd: string | undefined) {
	const { screenshots, add, remove } = useScreenshots();
	const { uploads, onDrop, onDragOver } = useScreenshotUpload(cwd, add);

	return {
		screenshots,
		removeScreenshot: remove,
		uploads,
		onDrop,
		onDragOver,
	};
}
