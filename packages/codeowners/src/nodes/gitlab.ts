import {
  InnerNode,
  Commentable,
  Ownable,
  LeafNode,
  parseInlineComment,
  NodeToken,
} from "./nodes";

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
    let str = `${this.optional ? GitlabNodeToken.OptionalSection : GitlabNodeToken.Section}${this.name}]`;
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

export enum GitlabNodeToken {
  Section = "[",
  OptionalSection = "^[",
}

const SectionNodeTokenRegexp = new RegExp(/(\[[\w\s]+\])(\[\d+\])*/);

function parseSection(str: string): [string, number | undefined] {
  const match = str.match(SectionNodeTokenRegexp);
  if (!match) {
    return ["", undefined];
  }

  const [, group1, group2] = match;
  const name = group1.replace(/\[|\]/g, "");
  let count: number | undefined;
  if (group2) {
    count = parseInt(group2.replace(/\[|\]/g, ""));
  }

  return [name, count];
}
