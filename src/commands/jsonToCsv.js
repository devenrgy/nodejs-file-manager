import { createReadStream, createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";

async function jsonToCsv(inputPath, outputPath) {
	try {
		await stat(inputPath);
	} catch {
		return false;
	}

	try {
		let buffer = "";
		let headers = [];
		let dataParsed = null;

		await pipeline(
			createReadStream(inputPath, { encoding: "utf8" }),
			async function* (source) {
				for await (const chunk of source) {
					buffer += chunk;
				}

				try {
					dataParsed = JSON.parse(buffer);
				} catch {
					throw new Error("Invalid JSON format");
				}

				if (!Array.isArray(dataParsed) || dataParsed.length === 0) {
					throw new Error("JSON must be a non-empty array");
				}

				headers = Object.keys(dataParsed[0]);

				const csvLines = [];
				csvLines.push(headers.map(escapeCSVField).join(","));

				for (const row of dataParsed) {
					const values = headers.map((header) =>
						escapeCSVField(row[header] ?? ""),
					);
					csvLines.push(values.join(","));
				}

				yield csvLines.join("\n");
			},
			createWriteStream(outputPath, { encoding: "utf8" }),
		);

		return true;
	} catch (error) {
		console.error("JSON to CSV conversion failed:", error.message);
		return false;
	}
}

function escapeCSVField(field) {
	const str = String(field);
	if (
		str.includes(",") ||
		str.includes('"') ||
		str.includes("\n") ||
		str.includes("\r")
	) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export { jsonToCsv };
