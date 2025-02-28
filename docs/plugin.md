# `build/plugin` module
```typescript
export function neoTempPlugin (options: Partial<Options>): VitePlugin;

export interface Options {
	libPath: string = `@neocomp/full/`,
	plugins: Plugin[],
	walk: Partial<WalkOptions> = { serialize: true }
}
```
this module exports the `neoTempPlugin`, a vite plugin that add support for template files
with hot reloading support.

template files are files that ends with `neo.html` that contains template definition.   
they are imported like normal javascript modules and export their content as `Record` of items 
as `default`.    
[more info](./comp-base.view/template-api.md#template-file).

`neoTempPlugin` takes `Options` and return a `VitePlugin`, `Options` consists of:
- `libPath`: the path to neocomp, default `@neocomp/full/`.
- `plugins`: the [`Plugin`s](./comp-base.view/template-api.md#plugin) used in template 
generation.
- `walk`: the [`WalkOptions`](./comp-base.view/template-api.md#walking).

the template files are grouped in `virtual:neo-template` namespace in vite.

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

`Serializer` takes the `value`, generation data in `data` and `Options` and return an expression 
string that evaluate to `value`.

`addSerializer`: add a `Serializer` for a given `type`.

`serialize`: serialize a `value` and take generation data in `data` and `Options`.

`GenData`: is data related to generation passed for every `Serializer`, it contains:
- `imports`: a `Record` of path and imported items, converted to import statements in the 
generated bundle.
- `const`: a `Record` of constant name and their expression strings, converted to constant 
declaration in the generated bundle.

there are built in `Serializer`s for `string`, `number`, `boolean`, `undefined`, `null`, 
`object`, `Array`, `SerializedFn` and `LiteNode`.

## `build/module.d.ts`
this modules add support for `.neo.html` files for typescript, must be imported once to be 
able to import these file.