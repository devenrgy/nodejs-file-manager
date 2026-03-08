import { createReadStream } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function logStats(inputPath, outputPath) {
	try {
		await stat(inputPath);
	} catch {
		return false;
	}

	try {
		const numWorkers = availableParallelism();
		const chunks = [];
		let currentChunk = [];

		const rl = createInterface({
			input: createReadStream(inputPath, { encoding: "utf8" }),
			crlfDelay: Infinity,
		});

		for await (const line of rl) {
			if (line.trim()) {
				currentChunk.push(line);

				if (currentChunk.length >= Math.ceil(10000 / numWorkers)) {
					chunks.push([...currentChunk]);
					currentChunk = [];
				}
			}
		}

		if (currentChunk.length > 0) {
			chunks.push(currentChunk);
		}

		if (chunks.length === 0) {
			const emptyStats = {
				total: 0,
				levels: {},
				status: {},
				topPaths: [],
				avgResponseTimeMs: 0,
			};
			await writeFile(outputPath, JSON.stringify(emptyStats, null, 2), {
				encoding: "utf8",
			});
			return true;
		}

		const workerPromises = chunks.map((chunk) => processChunkWithWorker(chunk));

		const partialStats = await Promise.all(workerPromises);
		const mergedStats = mergePartialStats(partialStats);

		const sortedPaths = Object.entries(mergedStats.pathCounts)
			.map(([path, count]) => ({ path, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		const avgResponseTimeMs =
			mergedStats.totalLines > 0
				? Math.round(
						(mergedStats.totalResponseTime / mergedStats.totalLines) * 100,
					) / 100
				: 0;

		const finalStats = {
			total: mergedStats.totalLines,
			levels: mergedStats.levels,
			status: mergedStats.status,
			topPaths: sortedPaths,
			avgResponseTimeMs,
		};

		await writeFile(outputPath, JSON.stringify(finalStats, null, 2), {
			encoding: "utf8",
		});

		return true;
	} catch (error) {
		console.error("logStats error:", error.message);
		return false;
	}
}

function processChunkWithWorker(lines) {
	return new Promise((resolve, reject) => {
		const workerPath = join(__dirname, "../workers/logWorker.js");
		const worker = new Worker(workerPath, {
			workerData: { lines },
		});

		worker.on("message", (result) => {
			resolve(result);
		});

		worker.once("error", (err) => {
			reject(err);
		});

		worker.once("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Worker exited with code ${code}`));
			}
		});
	});
}

function mergePartialStats(partialStats) {
	const merged = {
		totalLines: 0,
		levels: {},
		status: {},
		pathCounts: {},
		totalResponseTime: 0,
	};

	for (const stats of partialStats) {
		merged.totalLines += stats.totalLines || 0;
		merged.totalResponseTime += stats.totalResponseTime || 0;

		for (const [level, count] of Object.entries(stats.levels || {})) {
			merged.levels[level] = (merged.levels[level] || 0) + count;
		}

		for (const [statusClass, count] of Object.entries(stats.status || {})) {
			merged.status[statusClass] = (merged.status[statusClass] || 0) + count;
		}

		for (const [path, count] of Object.entries(stats.pathCounts || {})) {
			merged.pathCounts[path] = (merged.pathCounts[path] || 0) + count;
		}
	}

	return merged;
}

export { logStats };
