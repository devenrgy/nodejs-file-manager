import { realpath } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";

export async function resolvePath(targetPath, cwd, homeDir) {
	if (!targetPath) {
		return cwd;
	}

	const absolutePath = isAbsolute(targetPath)
		? targetPath
		: resolve(cwd, targetPath);

	const normalizedPath = resolve(absolutePath);
	const normalizedHome = resolve(homeDir);

	try {
		const realPath = await realpath(normalizedPath);
		const realHome = await realpath(normalizedHome);

		if (!realPath.startsWith(realHome)) {
			return null;
		}

		return realPath;
	} catch {
		if (!normalizedPath.startsWith(normalizedHome)) {
			return null;
		}
		return normalizedPath;
	}
}
