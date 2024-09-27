import { NodeToken, CommentNodeTokenRegexp } from "../tokens";
import { parseInlineComment } from "./util";

export abstract class AbstractNode {
  // the original content of the node when contructed
  protected readonly _content: string;
  constructor(content: string) {
    this._content = content;
  }

  abstract toString(): string;
}

export abstract class LeafNode extends AbstractNode {
  public parent: InnerNode | undefined;

  constructor(content: string, parent?: InnerNode) {
    super(content);
    this.parent = parent;
  }
}

export abstract class InnerNode extends LeafNode {
  public children: AbstractNode[];

  constructor(content: string, parent?: InnerNode, children?: AbstractNode[]) {
    super(content, parent);
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

  constructor(content: string, parent?: InnerNode) {
    super(content, parent);

    this.comment = content.replace(CommentNodeTokenRegexp, "");
  }

  public toString(): string {
    return `${NodeToken.Comment}${this.comment}`;
  }
}

export class PathNode extends LeafNode implements Commentable, Ownable {
  public path: string;
  public owners: string[];
  public comment: string | undefined;

  constructor(content: string, parent?: InnerNode) {
    super(content, parent);

    let idx: number;
    [this.comment, idx] = parseInlineComment(content);

    let subcontent = content;
    if (idx !== -1) {
      subcontent = subcontent.substring(0, idx);
    }

    // split on whitespace, but not escaped whitespace in case in path
    const [path, ...owners] = subcontent.trim().split(/(?<!\\)\s+/);
    this.path = path;
    this.owners = owners;
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
  public toString(): string {
    return this._content;
  }
}
