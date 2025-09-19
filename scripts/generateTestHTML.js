import { mkdir, writeFile } from "node:fs/promises";
import { dirname, basename } from "node:path";
import { entries } from "./entries.js";
import { existsSync } from "node:fs";
for (const entry of entries) {
  const path = "test/html/" + entry + ".html";
  await mkdir(dirname(path), { recursive: true });
  if (!existsSync(path)) writeFile(
    path,
    `<!doctype html>
<script type=module>
	import * as mod from '${"/src/" + entry + ".ts"}';
	globalThis.${basename(entry).match(/^[a-zA-Z]+/)?.[0]} = {...mod};
<\/script>`
  );
}
