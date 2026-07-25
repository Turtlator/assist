import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import {
	type DefaultExtensionType,
	type FileIconProps,
	defaultStyles,
	FileIcon,
} from "react-file-icon";

const aliases: Record<string, DefaultExtensionType> = {
	bash: "sys",
	cjs: "js",
	cts: "ts",
	fish: "sys",
	go: "c",
	kt: "java",
	less: "css",
	markdown: "md",
	mdx: "md",
	mjs: "js",
	mts: "ts",
	rs: "c",
	sh: "sys",
	sql: "c",
	swift: "c",
	toml: "ini",
	tsx: "ts",
	vue: "html",
	xml: "html",
	yaml: "yml",
	zsh: "sys",
};

const genericStyle: Partial<FileIconProps> = { type: "document" };

const wrapperSx = { width: 16, flexShrink: 0, display: "flex" } as const;

function extensionOf(path: string): string {
	const basename = path.slice(path.lastIndexOf("/") + 1);
	const cut = basename.lastIndexOf(".");
	return cut <= 0 ? "" : basename.slice(cut + 1).toLowerCase();
}

function styleFor(extension: string): Partial<FileIconProps> {
	const key = aliases[extension] ?? (extension as DefaultExtensionType);
	return defaultStyles[key] ?? genericStyle;
}

export function FileTypeIcon({ path }: { path: string }) {
	const theme = useTheme();
	const dark = theme.palette.mode === "dark";
	const extension = extensionOf(path);

	return (
		<Box sx={wrapperSx}>
			<FileIcon
				color={dark ? "#4c5057" : "#e2e5ea"}
				glyphColor={dark ? "#b9bfc8" : "#7c828c"}
				labelTextColor="#fff"
				extension={extension.length <= 4 ? extension : undefined}
				{...styleFor(extension)}
			/>
		</Box>
	);
}
