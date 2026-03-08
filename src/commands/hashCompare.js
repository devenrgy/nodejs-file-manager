import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { SUPPORTED_ALGORITHMS } from "../utils/constants.js";

async function hashCompare(inputPath, hashPath, algorithm = "sha256") {
	try {
		await stat(inputPath);
		await stat(hashPath);
	} catch {
		return null;
	}

	if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
		return null;
	}

	try {
		const hashStream = createHash(algorithm);
		await pipeline(createReadStream(inputPath), hashStream);
		const calculatedHash = hashStream.digest("hex").toLowerCase();

		const hashContent = await readFile(hashPath, { encoding: "utf8" });
		const expectedHash = hashContent.trim().toLowerCase();

		return calculatedHash === expectedHash;
	} catch {
		return null;
	}
}

export { hashCompare };
