import { describe, expect, it } from "vitest";
import { separateCommandLines } from "./separateCommandLines";

describe("separateCommandLines", () => {
	describe("when the command is a single line", () => {
		it("should return the command unchanged", () => {
			const command = "echo hi | wc -l";

			const result = separateCommandLines(command);

			expect(result).toBe(command);
		});
	});

	describe("when the command spans multiple lines", () => {
		it("should separate each line with a semicolon", () => {
			const result = separateCommandLines("echo hi\nrm -rf /tmp/zz");

			expect(result).toBe("echo hi;rm -rf /tmp/zz");
		});

		it("should separate every line of a three-line command", () => {
			const result = separateCommandLines("a\nb\nc");

			expect(result).toBe("a;b;c");
		});
	});

	describe("when a line ends with a continuation", () => {
		it("should keep the continuation intact", () => {
			const command = "echo hi \\\n  --flag";

			const result = separateCommandLines(command);

			expect(result).toBe(command);
		});
	});

	describe("when a newline is inside quotes", () => {
		it("should leave a single-quoted newline alone", () => {
			const command = "echo 'a\nb'";

			const result = separateCommandLines(command);

			expect(result).toBe(command);
		});

		it("should leave a double-quoted newline alone", () => {
			const command = 'echo "a\nb"';

			const result = separateCommandLines(command);

			expect(result).toBe(command);
		});

		it("should separate a newline that follows a quoted string", () => {
			const result = separateCommandLines("echo 'a b'\nrm -rf /tmp/zz");

			expect(result).toBe("echo 'a b';rm -rf /tmp/zz");
		});
	});
});
