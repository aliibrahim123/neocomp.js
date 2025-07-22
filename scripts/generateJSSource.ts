import { transform } from 'esbuild';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { extname, dirname } from 'node:path';

async function walk (path: string, srcDir: string, distDir: string) {
	for (const entry of await readdir(srcDir + path, { withFileTypes: true })) {
		const entryPath = (path === '' ? '' : path + '/') + entry.name;
		//dir: walk
		if (entry.isDirectory()) {
			walk(entryPath, srcDir, distDir);
			continue
		}
		
		//if dilw not typescript file, skip
		else if (extname(entry.name) !== '.ts') continue;
		
		await mkdir(dirname(distDir + entryPath), { recursive: true });
		//transform into javascript
		const result = await transform(await readFile(srcDir + entryPath, 'utf-8'), {
			format: 'esm',
			loader: 'ts'
		});
		//replace all dependencies into their js counterpart
		const code = result.code.replaceAll(/from\s*['"][^'"]+[.]ts['"]/g, match => match.slice(0, -4) + '.js'+ match.at(-1));
		writeFile(distDir + entryPath.slice(0, -2) + 'js', code)
	}
}

walk('', 'scripts/', 'scripts/');