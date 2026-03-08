import { count } from "./commands/count.js";
import { csvToJson } from "./commands/csvToJson.js";
import {
	decrypt,
	getSecurePassword as getDecryptPassword,
} from "./commands/decrypt.js";
import {
	encrypt,
	getSecurePassword as getEncryptPassword,
} from "./commands/encrypt.js";
import { hash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { logStats } from "./commands/logStats.js";
import { cd, formatEntry, ls, up } from "./navigation.js";
import {
	parseArguments,
	parseShellArgs,
	validateRequiredOptions,
} from "./utils/argParser.js";
import { SUPPORTED_ALGORITHMS } from "./utils/constants.js";
import { resolvePath } from "./utils/pathResolver.js";

const commands = {
	up: async (args, state) => {
		if (args.length > 0) throw new Error("Invalid input");
		state.cwd = up(state.cwd, state.homeDir);
	},

	cd: async (args, state) => {
		if (args.length !== 1) throw new Error("Invalid input");
		const newCwd = await cd(args[0], state.cwd, state.homeDir);
		if (newCwd === null) throw new Error("Operation failed");
		state.cwd = newCwd;
	},

	ls: async (args, state) => {
		if (args.length > 0) throw new Error("Invalid input");
		const entries = await ls(state.cwd);
		if (entries === null) throw new Error("Operation failed");
		for (const entry of entries) {
			console.log(formatEntry(entry.name, entry.type));
		}
	},

	"csv-to-json": async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input", "output"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		const outputPath = await resolvePath(
			values.output,
			state.cwd,
			state.homeDir,
		);

		if (!inputPath || !outputPath) throw new Error("Operation failed");

		const success = await csvToJson(inputPath, outputPath);
		if (!success) throw new Error("Operation failed");
	},

	"json-to-csv": async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input", "output"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		const outputPath = await resolvePath(
			values.output,
			state.cwd,
			state.homeDir,
		);

		if (!inputPath || !outputPath) throw new Error("Operation failed");

		const success = await jsonToCsv(inputPath, outputPath);
		if (!success) throw new Error("Operation failed");
	},

	count: async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		if (!inputPath) throw new Error("Operation failed");

		const result = await count(inputPath);
		if (result === null) throw new Error("Operation failed");

		console.log(
			`Lines: ${result.lines} Words: ${result.words} Characters: ${result.chars}`,
		);
	},

	hash: async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		if (!inputPath) throw new Error("Operation failed");

		const algorithm = values.algorithm || "sha256";
		if (!SUPPORTED_ALGORITHMS.includes(algorithm))
			throw new Error("Operation failed");

		const save = values.save === true;
		const result = await hash(inputPath, algorithm, save);
		if (result === null) throw new Error("Operation failed");

		console.log(`${algorithm}: ${result}`);
	},

	"hash-compare": async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input", "hash"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		const hashPath = await resolvePath(values.hash, state.cwd, state.homeDir);

		if (!inputPath || !hashPath) throw new Error("Operation failed");

		const algorithm = values.algorithm || "sha256";
		if (!SUPPORTED_ALGORITHMS.includes(algorithm))
			throw new Error("Operation failed");

		const result = await hashCompare(inputPath, hashPath, algorithm);
		if (result === null) throw new Error("Operation failed");

		console.log(result ? "OK" : "MISMATCH");
	},

	encrypt: async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input", "output"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		const outputPath = await resolvePath(
			values.output,
			state.cwd,
			state.homeDir,
		);

		if (!inputPath || !outputPath) throw new Error("Operation failed");

		const password = await getEncryptPassword(values.password);
		if (!password) throw new Error("Password is required");

		const success = await encrypt(inputPath, outputPath, password);
		if (!success) throw new Error("Operation failed");
	},

	decrypt: async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input", "output"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		const outputPath = await resolvePath(
			values.output,
			state.cwd,
			state.homeDir,
		);

		if (!inputPath || !outputPath) throw new Error("Operation failed");

		const password = await getDecryptPassword(values.password);
		if (!password) throw new Error("Password is required");

		const success = await decrypt(inputPath, outputPath, password);
		if (!success) throw new Error("Operation failed");
	},

	"log-stats": async (args, state) => {
		const { values } = parseArguments(args);
		if (!validateRequiredOptions(values, ["input", "output"]))
			throw new Error("Invalid input");

		const inputPath = await resolvePath(values.input, state.cwd, state.homeDir);
		const outputPath = await resolvePath(
			values.output,
			state.cwd,
			state.homeDir,
		);

		if (!inputPath || !outputPath) throw new Error("Operation failed");

		const success = await logStats(inputPath, outputPath);
		if (!success) throw new Error("Operation failed");
	},
};

async function handleInput(input, state) {
	const trimmed = input.trim();

	if (!trimmed) {
		return false;
	}

	if (trimmed === ".exit") {
		return true;
	}

	const parts = parseShellArgs(trimmed);
	const commandName = parts[0];
	const args = parts.slice(1);

	const command = commands[commandName];

	if (!command) {
		console.error("Invalid input");
		return false;
	}

	try {
		await command(args, state);
	} catch (error) {
		console.error(error.message);
	}

	return false;
}

export { handleInput };
