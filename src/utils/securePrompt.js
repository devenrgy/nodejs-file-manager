import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";

export async function promptPassword(promptText = "Password: ") {
	const rl = createInterface({
		input: stdin,
		output: stdout,
	});

	const rlPromisified = {
		question: (text) =>
			new Promise((resolve) => {
				rl.question(text, resolve);
			}),
		close: () => rl.close(),
	};

	try {
		const password = await rlPromisified.question(promptText);
		return password;
	} finally {
		rlPromisified.close();
	}
}
