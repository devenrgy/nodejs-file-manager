import { parentPort, workerData } from "node:worker_threads";

function parseLogLine(line) {
	const parts = line.trim().split(/\s+/);

	if (parts.length < 7) {
		return null;
	}

	const [, level, , statusCode, responseTime, , path] = parts;

	const statusCodeNum = parseInt(statusCode, 10);
	const responseTimeNum = parseInt(responseTime, 10);

	if (Number.isNaN(statusCodeNum) || Number.isNaN(responseTimeNum)) {
		return null;
	}

	if (!/^\d{3}$/.test(statusCode) || !/^\d+$/.test(responseTime)) {
		return null;
	}

	return {
		level,
		statusCode: statusCodeNum,
		responseTime: responseTimeNum,
		path,
	};
}

function getStatusClass(statusCode) {
	if (statusCode >= 200 && statusCode < 300) return "2xx";
	if (statusCode >= 300 && statusCode < 400) return "3xx";
	if (statusCode >= 400 && statusCode < 500) return "4xx";
	if (statusCode >= 500 && statusCode < 600) return "5xx";
	return "other";
}

function processChunk(lines) {
	const stats = {
		totalLines: 0,
		levels: {},
		status: {},
		pathCounts: {},
		totalResponseTime: 0,
	};

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;

		const parsed = parseLogLine(trimmedLine);
		if (!parsed) continue;

		stats.totalLines++;
		stats.totalResponseTime += parsed.responseTime;

		stats.levels[parsed.level] = (stats.levels[parsed.level] || 0) + 1;

		const statusClass = getStatusClass(parsed.statusCode);
		stats.status[statusClass] = (stats.status[statusClass] || 0) + 1;

		stats.pathCounts[parsed.path] = (stats.pathCounts[parsed.path] || 0) + 1;
	}

	return stats;
}

if (parentPort) {
	try {
		const { lines } = workerData;
		const result = processChunk(lines);
		parentPort.postMessage(result);
	} catch (error) {
		parentPort.postMessage({ error: error.message });
	}
}
