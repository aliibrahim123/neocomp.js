import { mkdir, writeFile } from "node:fs/promises";
import { dirname, basename } from "node:path";
import { entries } from "./entries.js";
for (const entry of entries) {
  const path = "test/html/" + entry + ".html";
  await mkdir(dirname(path), { recursive: true });
  writeFile(
    path,
    `<!doctype html>
<script type=module>
	import * as mod from '${"/src/" + entry + ".ts"}';
	globalThis.${basename(entry).match(/^[a-zA-Z]+/)?.[0]} = {...mod};
<\/script>`
  );
}
