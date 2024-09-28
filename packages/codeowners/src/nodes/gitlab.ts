import { InnerNode, Commentable, Ownable, LeafNode } from ".";
import { parseInlineComment, parseSection } from "./util";
import { NodeToken } from "../tokens";

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

  static parse(content: string, optional: boolean = false): SectionNode {
    const [comment, cIdx] = parseInlineComment(content);

    let subcontent = content;
    if (cIdx !== -1) {
      subcontent = subcontent.substring(0, cIdx);
    }

    const sIdx = subcontent.lastIndexOf("]");
    const section = subcontent.substring(0, sIdx + 1);
    const ownersStr = subcontent.substring(sIdx + 1).trim();
    let owners: string[] = [];
    if (ownersStr !== "") {
      owners = ownersStr.split(/\s+/);
    }

    const [name, count] = parseSection(section);
    return new SectionNode(name, optional, owners, count, comment);
  }

  public toString(): string {
    let str = `${this.optional ? "^" : ""}[${this.name}]`;
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
