import { NodeToken, CommentNodeTokenRegexp } from "../tokens";
import { parseInlineComment } from "./util";

export abstract class TNode {
  protected _parent: TNode | undefined;
  protected _children: TNode[];
  protected _content: string;

  constructor(content: string, parent?: TNode, children?: TNode[]) {
    this._content = content;
    this._parent = parent;
    this._children = children || [];
  }

  abstract toString(): string;
}

export interface Commentable {
  comment: string | undefined;
}

export interface Ownable {
  owners: string[];
}

export class CommentNode extends TNode implements Commentable {
  public comment: string;

  constructor(content: string, parent?: TNode, children?: TNode[]) {
    super(content, parent, children);

    this.comment = content.replace(CommentNodeTokenRegexp, "");
  }

  public toString(): string {
    return `${NodeToken.Comment}${this.comment}`;
  }
}

export class PathNode extends TNode implements Commentable, Ownable {
  public path: string;
  public owners: string[];
  public comment: string | undefined;

  constructor(content: string, parent?: TNode, children?: TNode[]) {
    super(content, parent, children);

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

export class NewlineNode extends TNode {
  public toString(): string {
    return this._content;
  }
}
