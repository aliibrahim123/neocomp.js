export class LiteNode {
	tag: string;
	attrs = new Map<string, string>();
	children: (string | LiteNode)[];
	parent: LiteNode | undefined;
	meta = new Map<string, any>();

	constructor (
		tag: string, attrs: Record<string, string> = {},
		children: (string | LiteNode)[] = [], meta: Record<string, any> = {}
	) {
		this.tag = tag;
		
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

	append (...children: (LiteNode | string)[]) {
		this.children.push(...children);
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;
	}
	prepend (...children: (LiteNode | string)[]) {
		this.children.unshift(...children);
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;
	}
	insertAt (ind: number, ...children: (LiteNode | string)[]) {
		this.children.splice(ind, 0, ...children);
		for (const child of children) 
			if (child instanceof LiteNode) child.parent = this;
		return this
	}
	
	before (...newSiblings: (LiteNode | string)[]) {
		if (!this.parent) return;
		const siblings = this.parent.children;
		siblings.splice(siblings.indexOf(this), 0, ...newSiblings);
		for (const sibling of newSiblings)
			if (sibling instanceof LiteNode) sibling.parent = this.parent;
	}
	after (...newSiblings: (LiteNode | string)[]) {
		if (!this.parent) return;
		const siblings = this.parent.children;
		siblings.splice(siblings.indexOf(this) + 1, 0, ...newSiblings);
		for (const sibling of newSiblings)
			if (sibling instanceof LiteNode) sibling.parent = this.parent;
	}

	remove () {
		if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
		this.parent = undefined;
	}
	replaceWith (node: LiteNode | string) {
		if (!this.parent) return;
		const siblings = this.parent.children;
		siblings[siblings.indexOf(this)] = node;
		if (node instanceof LiteNode) node.parent = this.parent;
		this.parent = undefined;
	}

	removeChild (ind: number) {
		if (this.children[ind] instanceof LiteNode) this.children[ind].parent = undefined;
		this.children.splice(ind, 1);
		return this
	}
	replaceChild (ind: number, child: LiteNode | string) {
		if (this.children[ind] instanceof LiteNode) this.children[ind].parent = undefined;
		this.children[ind] = child;
		if (child instanceof LiteNode) child.parent = this.parent;
	}
	removeChildren () {
		for (const child of this.children) 
			if (child instanceof LiteNode) child.parent = undefined;
		this.children = [];
	}
}