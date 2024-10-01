export enum NodeToken {
  Newline = "\n",
  Comment = "#",

  // Gitlab Spec Node Tokens
  Section = "[",
  OptionalSection = "^[",
}

/**
 *
 * Abstract Nodes and Interfaces
 *
 */

export abstract class AbstractNode {
  abstract toString(): string;
}

export abstract class LeafNode extends AbstractNode {
  public parent: InnerNode | undefined;

  constructor(parent?: InnerNode) {
    super();
    this.parent = parent;
  }
}

export abstract class InnerNode extends LeafNode {
  public children: AbstractNode[];

  constructor(parent?: InnerNode, children?: AbstractNode[]) {
    super(parent);
    this.children = children || [];

    for (const child of this.children) {
      if (child instanceof LeafNode) {
        child.parent = this;
      }
    }
  }
}

export interface Commentable {
  comment: string | undefined;
}

export interface Ownable {
  get owners(): string[];
  set owners(owners: string[]);
}

function isOwnable(node: any): node is Ownable {
  return (node as Ownable).owners !== undefined;
}

/**
 *
 * Default Spec Nodes
 *
 */

export class CommentNode extends LeafNode implements Commentable {
  public comment: string;

  constructor(comment: string, parent?: InnerNode) {
    super(parent);

    this.comment = comment;
  }

  public toString(): string {
    return `${NodeToken.Comment}${this.comment}`;
  }
}

export class PathNode extends LeafNode implements Commentable, Ownable {
  public path: string;
  private _owners: string[];
  public comment: string | undefined;

  constructor(
    path: string,
    owners: string[] = [],
    comment?: string,
    parent?: InnerNode,
  ) {
    super(parent);
    this.path = path;
    this._owners = owners;
    this.comment = comment;
  }

  public toString(): string {
    let str = this.path;
    for (const owner of this._owners) {
      str += ` ${owner}`;
    }
    if (this.comment) {
      str += ` ${NodeToken.Comment}${this.comment}`;
    }
    return str;
  }

  public get owners(): string[] {
    if (this._owners.length > 0) {
      return this._owners;
    }
    return this.parent && isOwnable(this.parent) ? [...this.parent.owners] : [];
  }

  public set owners(owners: string[]) {
    this._owners = owners;
  }
}

export class RawNode extends LeafNode {
  public value: string;

  constructor(value: string, parent?: InnerNode) {
    super(parent);
    this.value = value;
  }

  public toString(): string {
    return this.value;
  }
}

/**
 *
 * Gitlab Spec Nodes
 *
 */

export class SectionNode extends InnerNode implements Commentable, Ownable {
  public name: string;
  public optional: boolean;
  public owners: string[];
  public count: number | undefined;
  public comment: string | undefined;

  constructor(
    name: string,
    optional: boolean = false,
    owners: string[] = [],
    count?: number | undefined,
    comment?: string | undefined,
    parent?: InnerNode,
    children?: LeafNode[],
  ) {
    super(parent, children);
    this.name = name;
    this.optional = optional;
    this.owners = owners;
    this.count = count;
    this.comment = comment;
  }

  public toString(): string {
    let str = `${this.optional ? NodeToken.OptionalSection : NodeToken.Section}${this.name}]`;
    if (this.count) {
      str += `[${this.count}]`;
    }
    for (const owner of this.owners) {
      str += ` ${owner}`;
    }
    if (this.comment) {
      str += ` ${NodeToken.Comment}${this.comment}`;
    }

    for (const child of this.children) {
      str += `\n${child.toString()}`;
    }
    return str;
  }
}
