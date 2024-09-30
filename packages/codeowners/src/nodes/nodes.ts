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
  }
}

export interface Commentable {
  comment: string | undefined;
}

export interface Ownable {
  owners: string[];
}

export function isOwnable(node: any): node is Ownable {
  return (node as Ownable).owners !== undefined;
}

export class CommentNode extends LeafNode implements Commentable {
  public comment: string;

  constructor(comment: string, parent?: InnerNode) {
    super(parent);

    this.comment = comment;
  }

  static parse(content: string): CommentNode {
    const comment = content.replace(CommentNodeTokenRegexp, "");
    return new CommentNode(comment);
  }

  public toString(): string {
    return `${NodeToken.Comment}${this.comment}`;
  }
}

export class PathNode extends LeafNode implements Commentable, Ownable {
  public path: string;
  public owners: string[];
  public comment: string | undefined;

  constructor(
    path: string,
    owners: string[],
    comment?: string,
    parent?: InnerNode,
  ) {
    super(parent);
    this.path = path;
    this.owners = owners;
    this.comment = comment;
  }

  static parse(content: string): PathNode {
    const [comment, idx] = parseInlineComment(content);

    let subcontent = content;
    if (idx !== -1) {
      subcontent = subcontent.substring(0, idx);
    }

    // split on whitespace, but not escaped whitespace in case in path
    const [path, ...owners] = subcontent.trim().split(/(?<!\\)\s+/);
    return new PathNode(path, owners, comment);
  }

  public toString(): string {
    let str = this.path;
    for (const owner of this.owners) {
      str += ` ${owner}`;
    }
    if (this.comment) {
      str += ` ${NodeToken.Comment}${this.comment}`;
    }
    return str;
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

export function parseInlineComment(str: string): [string | undefined, number] {
  const idx = str.indexOf(` ${NodeToken.Comment}`);
  if (idx === -1) {
    return [undefined, idx];
  }
  return [str.substring(idx + 2), idx];
}

export enum NodeToken {
  Newline = "\n",
  Comment = "#",
}

const CommentNodeTokenRegexp = new RegExp(`^${NodeToken.Comment}`);
