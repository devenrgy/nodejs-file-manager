import { createDecipheriv, scrypt } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { open, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import {
	ALGORITHM,
	AUTH_TAG_LENGTH,
	HEADER_LENGTH,
	KEY_LENGTH,
	SALT_LENGTH,
} from "../utils/constants.js";
import { promptPassword } from "../utils/securePrompt.js";

const scryptAsync = promisify(scrypt);

async function decrypt(inputPath, outputPath, password) {
	let fileSize;
	try {
		const stats = await stat(inputPath);
		fileSize = stats.size;
	} catch {
		return false;
	}

	if (fileSize <= HEADER_LENGTH + AUTH_TAG_LENGTH) {
		return false;
	}

	try {
		const headerBuffer = await readBytes(inputPath, 0, HEADER_LENGTH);
		const salt = headerBuffer.subarray(0, SALT_LENGTH);
		const iv = headerBuffer.subarray(SALT_LENGTH, HEADER_LENGTH);

		const authTagPosition = fileSize - AUTH_TAG_LENGTH;
		const authTag = await readBytes(inputPath, authTagPosition, fileSize);

		const key = await scryptAsync(password, salt, KEY_LENGTH);

		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		const readStream = createReadStream(inputPath, {
			start: HEADER_LENGTH,
			end: authTagPosition - 1,
		});
		const writeStream = createWriteStream(outputPath);

		await pipeline(readStream, decipher, writeStream);

		return true;
	} catch (error) {
		if (error.message.includes("authTag")) {
			console.error("Decryption failed: Invalid password or corrupted data");
		} else {
			console.error("Decryption failed:", error.message);
		}
		return false;
	}
}

async function readBytes(filePath, start, end) {
	const fd = await open(filePath, "r");
	try {
		const buffer = Buffer.alloc(end - start);
		const { bytesRead } = await fd.read(buffer, 0, buffer.length, start);
		if (bytesRead !== buffer.length) {
			throw new Error("Could not read expected number of bytes");
		}
		return buffer;
	} finally {
		await fd.close();
	}
}

async function getSecurePassword(password) {
	if (password) {
		return password;
	}
	return promptPassword("Enter password for decryption: ");
}

export { decrypt, getSecurePassword };
