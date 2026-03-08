import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";

async function count(inputPath) {
	try {
		await stat(inputPath);
	} catch {
		return null;
	}

	try {
		let lines = 0;
		let words = 0;
		let chars = 0;

		const readStream = createReadStream(inputPath, { encoding: "utf8" });

		for await (const chunk of readStream) {
			chars += chunk.length;

			const lineCount = (chunk.match(/\n/g) || []).length;
			lines += lineCount;

			const wordList = chunk
				.trim()
				.split(/\s+/)
				.filter((w) => w.length > 0);
			words += wordList.length;
		}

		return { lines, words, chars };
	} catch (error) {
		console.error("Count operation failed:", error.message);
		return null;
	}
}

export { count };
