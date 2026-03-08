import { userInfo } from "node:os";
import { exit, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { handleInput } from "./repl.js";

const WELCOME_MESSAGE = "Welcome to Data Processing CLI!";
const GOODBYE_MESSAGE = "Thank you for using Data Processing CLI!";

class DataProcessingCLI {
	#cwd;
	#homeDir;
	#rl;
	#username;

	constructor() {
		const user = userInfo();
		this.#username = user.username;
		this.#homeDir = user.homedir;
		this.#cwd = this.#homeDir;
		this.#rl = null;
	}

	get cwd() {
		return this.#cwd;
	}

	get homeDir() {
		return this.#homeDir;
	}

	#processing = false;
	#lineQueue = [];
	#exiting = false;

	#setupInputListener() {
		this.#rl = createInterface({
			input: stdin,
			output: stdout,
			prompt: "> ",
		});

		this.#rl.on("close", () => this.#onClose());
		this.#rl.on("line", (line) => this.#queueLine(line));

		this.#rl.prompt();
	}

	#onClose() {
		if (this.#processing || this.#lineQueue.length > 0) {
			this.#exiting = true;
			return;
		}
		this.#exit();
	}

	#queueLine(line) {
		this.#lineQueue.push(line);
		this.#processQueue();
	}

	async #processQueue() {
		if (this.#processing || this.#lineQueue.length === 0) {
			return;
		}

		this.#processing = true;

		while (this.#lineQueue.length > 0) {
			const line = this.#lineQueue.shift();
			const shouldExit = await this.#handleLine(line);
			if (shouldExit) {
				this.#exiting = true;
				break;
			}
		}

		this.#processing = false;

		if (this.#exiting) {
			this.#exit();
		}
	}

	async #handleLine(line) {
		try {
			const state = {
				cwd: this.#cwd,
				homeDir: this.#homeDir,
			};
			const shouldExit = await handleInput(line, state);

			this.#cwd = state.cwd;

			if (shouldExit) {
				return true;
			} else {
				console.log(this.#cwd);
				if (!this.#rl?.closed) {
					this.#rl.prompt();
				}
			}
		} catch {
			console.error("Operation failed");
			console.log(this.#cwd);
			if (!this.#rl?.closed) {
				this.#rl.prompt();
			}
		}
		return false;
	}

	#exit() {
		console.log(GOODBYE_MESSAGE);
		exit(0);
	}

	#welcome() {
		console.log(WELCOME_MESSAGE);
		console.log(`You are currently in ${this.#cwd}`);
	}

	run() {
		this.#welcome();
		this.#setupInputListener();
	}
}

const cli = new DataProcessingCLI();
cli.run();
