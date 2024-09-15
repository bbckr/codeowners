import { TNode, Commentable, Ownable } from ".";
import { parseInlineComment, parseSection } from "./util";
import { NodeToken } from "../tokens";

export class SectionNode extends TNode implements Commentable, Ownable {
  public name: string;
  public count: number | undefined;
  public owners: string[] = [];
  public comment: string | undefined;
  public optional: boolean;

  constructor(
    content: string,
    optional: boolean = false,
    parent?: TNode,
    children?: TNode[],
  ) {
    super(content, parent, children);

    this.optional = optional;

    let idx: number;
    [this.comment, idx] = parseInlineComment(content);

    let subcontent = content;
    if (idx !== -1) {
      subcontent = subcontent.substring(0, idx);
    }

    let section: string;
    [section, ...this.owners] = subcontent.split(" ");

    [this.name, this.count] = parseSection(section);
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
    return str;
  }
}
