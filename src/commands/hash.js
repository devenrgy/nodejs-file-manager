import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { SUPPORTED_ALGORITHMS } from "../utils/constants.js";

async function hash(inputPath, algorithm = "sha256", save = false) {
	try {
		await stat(inputPath);
	} catch {
		return null;
	}

	if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
		return null;
	}

	try {
		const hashStream = createHash(algorithm);

		await pipeline(createReadStream(inputPath), hashStream);

		const digest = hashStream.digest("hex");

		if (save) {
			const hashFileName = `.${basename(inputPath)}.${algorithm}`;
			const hashFilePath = join(dirname(inputPath), hashFileName);
			await writeFile(hashFilePath, digest, { encoding: "utf8" });
		}

		return digest;
	} catch {
		return null;
	}
}

export { hash };
