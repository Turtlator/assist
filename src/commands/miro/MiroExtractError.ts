export class MiroExtractError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MiroExtractError";
	}
}
