import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

async function cd(targetPath, currentCwd, homeDir) {
	try {
		const newCwd = resolve(currentCwd, targetPath);

		if (!newCwd.startsWith(homeDir)) {
			return null;
		}

		const stats = await stat(newCwd);
		if (!stats.isDirectory()) {
			return null;
		}

		return newCwd;
	} catch {
		return null;
	}
}

function up(currentCwd, homeDir) {
	const parent = resolve(currentCwd, "..");

	if (!parent.startsWith(homeDir)) {
		return currentCwd;
	}

	return parent;
}

async function ls(dirPath, showHidden = false) {
	try {
		const entries = await readdir(dirPath, { withFileTypes: true });

		const folders = [];
		const files = [];

		for (const entry of entries) {
			if (!showHidden && entry.name.startsWith(".")) {
				continue;
			}

			if (entry.isDirectory()) {
				folders.push({ name: entry.name, type: "folder" });
			} else if (entry.isFile()) {
				files.push({ name: entry.name, type: "file" });
			}
		}

		folders.sort((a, b) => a.name.localeCompare(b.name));
		files.sort((a, b) => a.name.localeCompare(b.name));

		return [...folders, ...files];
	} catch {
		return null;
	}
}

function formatEntry(name, type) {
	return `${name} [${type}]`;
}

export { cd, up, ls, formatEntry };
