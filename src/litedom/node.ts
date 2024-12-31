export class LiteNode {
	tag: string;
	attrs = new Map<string, string | number | boolean>();
	classList: Set<string>;
	children: (string | LiteNode)[];
	parent: LiteNode | undefined;
	meta = new Map<string, any>();

	constructor (
		//attrs.T contains string[] since of class attr, it doesnt reflect true string[] attr support
		tag: string, attrs: Record<string, string | number | boolean | string[]> = {},
		children: (string | LiteNode)[] = [], meta: Record<string, any> = {}
	) {
		this.tag = tag;
		//handle special attrs
		this.classList = new Set(attrs['class'] as string[]);
		if ('class' in attrs) attrs['class'] = undefined as any;

		for (const attr in attrs) 
			if (attrs[attr] !== undefined) this.attrs.set(attr, attrs[attr] as any);
		
		this.children = children;
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;

		for (const key in meta) this.meta.set(key, meta[key]);
	}

	get childIndex () {
		return this.parent?.children?.indexOf?.(this);
	}

	get nextSibling (): LiteNode | string | undefined {
		if (!this.parent) return;
		const siblings = this.parent.children;
		return siblings[siblings.indexOf(this) + 1];
	}
	get prevSibling (): LiteNode | string | undefined {
		if (!this.parent) return;
		const siblings = this.parent.children;
		return siblings[siblings.indexOf(this) - 1];
	}

	append (...children: (LiteNode | string)[]): this {
		this.children.push(...children);
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;
		return this;
	}
	prepent (...children: (LiteNode | string)[]): this {
		this.children.unshift(...children);
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;
		return this;
	}
	insertAt (ind: number, ...children: (LiteNode | string)[]): this {
		this.children.splice(ind, 0, ...children);
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;
		return this
	}
	
	before (...newSiblings: (LiteNode | string)[]): this {
		if (!this.parent) return this;
		const siblings = this.parent.children;
		siblings.splice(siblings.indexOf(this), 0, ...newSiblings);
		for (const sibling of newSiblings)
			if (sibling instanceof LiteNode) sibling.parent = this.parent;
		return this;
	}
	after (...newSiblings: (LiteNode | string)[]): this {
		if (!this.parent) return this;
		const siblings = this.parent.children;
		siblings.splice(siblings.indexOf(this) + 1, 0, ...newSiblings);
		for (const sibling of newSiblings)
			if (sibling instanceof LiteNode) sibling.parent = this.parent;
		return this;
	}

	remove (): this {
		if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
		this.parent = undefined;
		return this;
	}
	replaceWith (node: LiteNode | string): this {
		if (!this.parent) return this;
		const siblings = this.parent.children;
		siblings[siblings.indexOf(this)] = node;
		if (node instanceof LiteNode) node.parent = this.parent;
		this.parent = undefined;
		return this;
	}

	removeChild (ind: number) {
		if (this.children[ind] instanceof LiteNode) this.children[ind].parent = undefined;
		this.children.splice(ind, 1);
		return this
	}
	replaceChild (ind: number, child: LiteNode | string): this {
		if (this.children[ind] instanceof LiteNode) this.children[ind].parent = undefined;
		this.children[ind] = child;
		if (child instanceof LiteNode) child.parent = this.parent;
		return this;
	}
	removeChildren (): this {
		for (const child of this.children) 
			if (child instanceof LiteNode) child.parent = undefined;
		this.children = [];
		return this;
	}
}