import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";

async function csvToJson(inputPath, outputPath) {
	try {
		await stat(inputPath);
	} catch {
		return false;
	}

	try {
		const headers = [];
		const results = [];
		let headersParsed = false;
		let buffer = "";

		await pipeline(
			createReadStream(inputPath, { encoding: "utf8" }),
			async function* (source) {
				source.setEncoding("utf8");
				for await (const chunk of source) {
					buffer += chunk;
					const lines = buffer.split(/\r?\n/);
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmedLine = line.trim();
						if (!trimmedLine) continue;

						const fields = parseCSVLine(trimmedLine);

						if (!headersParsed) {
							headers.push(...fields);
							headersParsed = true;
						} else {
							const obj = {};
							for (let i = 0; i < headers.length; i++) {
								obj[headers[i]] = fields[i] || "";
							}
							results.push(obj);
						}
					}
				}

				if (buffer.trim()) {
					const fields = parseCSVLine(buffer.trim());
					if (headersParsed) {
						const obj = {};
						for (let i = 0; i < headers.length; i++) {
							obj[headers[i]] = fields[i] || "";
						}
						results.push(obj);
					}
				}

				yield JSON.stringify(results);
			},
			createWriteStream(outputPath, { encoding: "utf8" }),
		);

		return true;
	} catch (error) {
		console.error("CSV to JSON conversion failed:", error.message);
		return false;
	}
}

function parseCSVLine(line) {
	const fields = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (inQuotes) {
			if (char === '"' && nextChar === '"') {
				current += '"';
				i++;
			} else if (char === '"') {
				inQuotes = false;
			} else {
				current += char;
			}
		} else {
			if (char === '"') {
				inQuotes = true;
			} else if (char === ",") {
				fields.push(current);
				current = "";
			} else {
				current += char;
			}
		}
	}

	fields.push(current);
	return fields;
}

export { csvToJson };
