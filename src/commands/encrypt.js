import { createCipheriv, randomBytes, scrypt } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import {
	ALGORITHM,
	IV_LENGTH,
	KEY_LENGTH,
	SALT_LENGTH,
} from "../utils/constants.js";
import { promptPassword } from "../utils/securePrompt.js";

const scryptAsync = promisify(scrypt);

async function encrypt(inputPath, outputPath, password) {
	try {
		await stat(inputPath);

		const salt = randomBytes(SALT_LENGTH);
		const iv = randomBytes(IV_LENGTH);

		const key = await scryptAsync(password, salt, KEY_LENGTH);
		const cipher = createCipheriv(ALGORITHM, key, iv);

		const readStream = createReadStream(inputPath);
		const writeStream = createWriteStream(outputPath);

		writeStream.write(salt);
		writeStream.write(iv);

		await pipeline(readStream, cipher, writeStream, { end: false });

		const authTag = cipher.getAuthTag();

		return new Promise((resolve) => {
			writeStream.end(authTag, () => {
				resolve(true);
			});
		});
	} catch (error) {
		console.error("Encryption failed:", error.message);
		return false;
	}
}

async function getSecurePassword(password) {
	if (password) {
		return password;
	}
	return promptPassword("Enter password for encryption: ");
}

export { encrypt, getSecurePassword };
