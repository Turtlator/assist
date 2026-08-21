export type MiroRawItem = {
	id?: string;
	type?: string;
	data?: { content?: string };
	geometry?: { width?: number; height?: number };
	position?: { relativeTo?: string; x?: number; y?: number };
};

export type MiroRawPage = {
	data?: MiroRawItem[];
};

export type MiroItem = {
	id: string;
	type: string;
	text: string;
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export type MiroRect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export type MiroBoardPreview = {
	boxes: MiroItem[];
};
