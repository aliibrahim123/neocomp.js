import type { ConstructorFor } from "../common/types.ts";
import { SerializedFn, type Fn } from "../comp-base/view/walkInterface.ts";
import { LiteNode } from "../litedom/node.ts";
import type { GenData, Options } from "./plugin.ts";

export type Serializer = (value: any, data: GenData, options: Options) => string;

export function serialize (
	value: any, data: GenData, options: Options
) {
	if (
		value === undefined || value === null || 
		typeof(value) === 'boolean' || typeof(value) === 'number'
	) return String(value);

	const serializer = serializers.get(value.constructor);
	if (!serializer) 
		throw new TypeError(`neotemp: undefined serializer for type (${value.constructor.name})`);

	return serializer(value, data, options);	
}

const serializers = new Map<ConstructorFor<any>, Serializer>();
serializers.set(SerializedFn, (value: SerializedFn) => 
	`new Function (${value.args.map(arg => `'${arg}'`).join(', ')}, \`${value.source.replaceAll('$', '\\$')}\`)`
);
serializers.set(Object, (value, data, options) => {
	const chunks: string[] = [];

	for (const prop in value) chunks.push(`'${prop}': ${serialize(value[prop], data, options)}`);

	return `{${chunks.join(', ')}}`
});
serializers.set(Array, (value: any[], data, options) => 
	`[${value.map(value => serialize(value, data, options)).join(', ')}]`
);
serializers.set(String, (value: string) => 
	'`' + value.replaceAll('$', '\\$') + '`'
);
serializers.set(LiteNode, (value: LiteNode, data, options) => {
	const attrs = serialize(mapToObject(value.attrs), data, options);
	const children = serialize(value.children, data, options);
	const meta = serialize(mapToObject(value.meta), data, options);
	return `new LiteNode('${value.tag}', ${attrs}, ${children}, ${meta})`
});

function mapToObject (map: Map<string, any>) {
	const obj: Record<string, any> = {};
	for (const [key, value] of map) obj[key] = value;
	return obj;
}

export function addSerializer (type: ConstructorFor<any>, serializer: Serializer) {
	serializers.set(type, serializer);
}