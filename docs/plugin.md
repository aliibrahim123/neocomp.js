# `build/plugin` module
```typescript
export function neoTempPlugin (options: Partial<Options>): VitePlugin;

export interface Options {
	libPath: string = `@neocomp/full/`,
	plugins: Plugin[],
	walk: Partial<WalkOptions> = { serialize: true },
	macro: boolean = false,
	include: string[] = ['./src/']
}
```
this module exports the `neoTempPlugin`, a vite plugin that add support for template files and `$template` macro with hot reloading.

template files are files that ends with `.neo.html` that contains template definition.   
they are imported like normal javascript modules and export their content as `Record` of items 
as `default`.    
[more info](./comp-base.view/template-api.md#template-file).

#### example
```html
<!-- src/template.neo.html -->
<neo:template id=hello><div>hello</div></neo:template>
```
```typescript
// src/main.ts
import templates from './template.neo.html';

class Example extends Component<TypeMap> {
	static template = templates.hello;
}
```

## neo template plugin
`neoTempPlugin` takes `Options` and return a `VitePlugin`.

`Options` consists of:
- `libPath`: the path to neocomp, default `@neocomp/full/`.
- `plugins`: the [plugins](./comp-base.view/template-api.md#plugin) used in template 
generation.
- `walk`: the [walk options](./comp-base.view/template-api.md#walking).
- `macro`: whether to enabled the `$template` macro serialization.
- `include`: a list of path that uses the `$template` macro.

the template files are grouped in `virtual:neo-template` namespace in vite.

#### example
```typescript
//vite.config.js
import { neoTempPlugin } from '@neocomp/full/build';

export default {
	plugins: [neoTempPlugin({ macro: true })]
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

`Serializer` takes the value, generation data in `data` and the plugin options and return an 
expression string that evaluate to the value.

`addSerializer`: add a serializer for a given type.

`serialize`: serialize a value and take generation data in `data` and the plugin options.

`GenData`: is data related to generation passed for every serializer, it contains:
- `imports`: a record of path and imported items, converted to import statements in the 
generated bundle.
- `const`: a record of constant name and their expression strings, converted to constant 
declaration in the generated bundle.

there are built in serializers for `string`, `number`, `boolean`, `undefined`, `null`, 
`object`, `Array`, `SerializedFn` and `LiteNode`.

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

## `build/module.d.ts`
this modules add type support for `.neo.html` files for typescript, must be imported once to be 
able to import these file.

```typescript
// some file in the project
import '@neocomp/full/build/module.d.ts';
```