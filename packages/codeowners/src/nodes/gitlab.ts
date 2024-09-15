import { TNode, Commentable, Ownable } from ".";
import { parseInlineComment, parseSection } from "./util";

export class SectionNode extends TNode implements Commentable, Ownable {
  public name: string;
  public count: number | undefined;
  public owners: string[] = [];
  public comment: string | undefined;
  public optional: boolean;

  constructor(
    content: string,
    parent?: TNode,
    children?: TNode[],
    optional: boolean = false,
  ) {
    super(content, parent, children);

    this.optional = optional;

    let idx: number;
    [this.comment, idx] = parseInlineComment(content);

    let section = content;
    if (idx !== -1) {
      section = section.substring(0, idx);
    }

    [section, ...this.owners] = section.split(" ");

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
    return str;
  }
}
