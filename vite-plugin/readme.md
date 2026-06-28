# vite plugin for neocomp
this package provide a vite plugin for parsing neocomp chunks defined in `html` tagged templates.

it provides a function `neocomp` that accepts an `Option` object and returns a vite plugin.

### Option
```ts
export interface Options {
	/** transform modules only from these directories */
	include: string[] = ['./src/'];
}
```

### usage
```ts
import { defineConfig } from 'vite';
import { neocomp } from '@neocomp/vite-plugin';

export default defineConfig({
	// ...
	plugins: [neocomp()],
});

```