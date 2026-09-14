const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024;

export function uploadSizeLimit(contentType: string): {
	maxBytes: number;
	tooLargeMessage: string;
} {
	const mime = contentType.split(";")[0].trim().toLowerCase();
	return mime.startsWith("video/")
		? {
				maxBytes: MAX_VIDEO_BYTES,
				tooLargeMessage: "Video too large (max 10MB).",
			}
		: {
				maxBytes: MAX_IMAGE_BYTES,
				tooLargeMessage: "Image too large (max 25MB).",
			};
}
