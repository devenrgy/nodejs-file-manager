import { parseArgs } from "node:util";

export function parseArguments(args) {
	const options = {
		input: { type: "string", short: "i" },
		output: { type: "string", short: "o" },
		algorithm: { type: "string", short: "a" },
		hash: { type: "string", short: "h" },
		password: { type: "string", short: "p" },
		save: { type: "boolean", short: "s" },
	};

	try {
		return parseArgs({ args, options, strict: false });
	} catch {
		return { values: {}, positionals: [] };
	}
}

export function validateRequiredOptions(values, required) {
	for (const opt of required) {
		if (!(opt in values) || values[opt] === undefined || values[opt] === true) {
			return false;
		}
	}
	return true;
}

export function parseShellArgs(input) {
	const args = [];
	let current = "";
	let inQuote = false;
	let quoteChar = "";

	for (let i = 0; i < input.length; i++) {
		const char = input[i];

		if (inQuote) {
			if (char === quoteChar) {
				inQuote = false;
				quoteChar = "";
			} else {
				current += char;
			}
		} else if (char === '"' || char === "'") {
			inQuote = true;
			quoteChar = char;
		} else if (char === " " || char === "\t") {
			if (current) {
				args.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}

	if (current) {
		args.push(current);
	}

	return args;
}
