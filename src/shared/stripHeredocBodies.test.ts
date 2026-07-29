import { describe, expect, it } from "vitest";
import { stripHeredocBodies } from "./stripHeredocBodies";

describe("stripHeredocBodies", () => {
	describe("when the command has no heredoc", () => {
		it("should return the command unchanged", () => {
			const command = "cat file.txt | grep name";

			const result = stripHeredocBodies(command);

			expect(result).toBe(command);
		});
	});

	describe("when the heredoc has no body", () => {
		it("should return the command unchanged", () => {
			const command = "cat <<'JSON' | assist backlog propose --json -";

			const result = stripHeredocBodies(command);

			expect(result).toBe(command);
		});
	});

	describe("when the heredoc has a body", () => {
		it("should remove the body and terminator", () => {
			const command = 'cat <<\'JSON\' | wc -l\n{"name":"x"}\nJSON';

			const result = stripHeredocBodies(command);

			expect(result).toBe("cat <<'JSON' | wc -l\n");
		});

		it("should keep commands that follow the terminator", () => {
			const command = "cat <<'JSON' | wc -l\nbody\nJSON\necho done";

			const result = stripHeredocBodies(command);

			expect(result).toBe("cat <<'JSON' | wc -l\necho done");
		});

		it("should remove a tab-indented <<- body", () => {
			const command = "cat <<-EOF | wc -l\n\tbody\n\tEOF";

			const result = stripHeredocBodies(command);

			expect(result).toBe("cat <<-EOF | wc -l\n");
		});

		it("should remove an unterminated body", () => {
			const command = "cat <<EOF | wc -l\nbody\nmore body";

			const result = stripHeredocBodies(command);

			expect(result).toBe("cat <<EOF | wc -l\n");
		});

		it("should not treat a << inside the body as a header", () => {
			const command = "cat <<EOF | wc -l\na << b\nEOF\necho done";

			const result = stripHeredocBodies(command);

			expect(result).toBe("cat <<EOF | wc -l\necho done");
		});

		it("should remove each body of two heredocs on one line", () => {
			const command = "diff <<A <<B | wc -l\nfirst\nA\nsecond\nB";

			const result = stripHeredocBodies(command);

			expect(result).toBe("diff <<A <<B | wc -l\n");
		});
	});

	describe("when << appears inside quotes", () => {
		it("should leave a single-quoted << alone", () => {
			const command = "echo 'a << b'\nnext";

			const result = stripHeredocBodies(command);

			expect(result).toBe(command);
		});

		it("should leave a double-quoted << alone", () => {
			const command = 'echo "a << b"\nnext';

			const result = stripHeredocBodies(command);

			expect(result).toBe(command);
		});

		it("should leave a here-string alone", () => {
			const command = "cat <<< hello\nnext";

			const result = stripHeredocBodies(command);

			expect(result).toBe(command);
		});
	});
});
