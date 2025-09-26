# `build/plugin` module
```typescript
export function neoTempPlugin (options: Partial<Options>): VitePlugin;

export interface Options {
	libPath: string = `@neocomp/full/`,
	include: string[] = ['./src/']
}
```
this module exports the `neoTempPlugin`, a vite plugin that add support `$temp` macro.

this plugin optimise the `$temp` and `$chunk` macros at build time, by generation a direct representation of the chunks without requiring runtime parsing.

`neoTempPlugin` takes `Options` and return a `VitePlugin`.

`Options` consists of:
- `libPath`: the path to neocomp, default `@neocomp/full/`.
- `include`: a list of path that uses the `$temp` macro.

#### example
```typescript
// vite.config.js
import { neoTempPlugin } from '@neocomp/full/build';

export default {
	plugins: [neoTempPlugin({ include: ['./src/components'] })]
}
```

## serialization
```typescript
export interface GenData {
	imports: Record<string, Set<string>>,
	consts: Record<string, string>
}

export type Serializer = (value: any, data: GenData, options: Options) => string;

export function serialize (value: any, data: GenData, options: Options): string;

export function addSerializer (type: new (...args: any[]) => any, serializer: Serializer): void;
```
serialization convert the values into an expression string that evalute into them.

`Serializer` takes the value, generation data in `data` and the plugin options and return an expression string that evaluate to the value.

`addSerializer`: add a serializer for a given type.

`serialize`: serialize a value and take generation data in `data` and the plugin options.

`GenData`: is data related to generation passed for every serializer, it contains:
- `imports`: a record of path and imported items, converted to import statements in the generated bundle.
- `const`: a record of constant name and their expression strings, converted to constant declaration in the generated bundle.

there are built in serializers for `string`, `number`, `boolean`, `undefined`, `null`, `object`, `Array`, and `LiteNode`.

#### example
```typescript
addSerializer(BigInt, (value) => `${value}n`);

serialize({ a: 1n, b: 'b', c: true }, genData, options); // => `{ a: 1n, b: 'b', c: true }`

const genData: GenData = {
	imports: {
		'some-lib/some-module': new Set(['item1', 'item2'])
	},
	consts: {
		'someConst': 'item1(new item2())'
	}
}; /* =>
import { item1, item2 } from 'some-lib/some-module';

const someConst = item1(new item2());
*/
```