import { CommentNode, PathNode, RawNode, TNode } from "../nodes";
import { NodeToken } from "../tokens";

export type DefaultNodes = CommentNode | PathNode | RawNode;

export interface ParsingRules {
  predicate: (line: string) => boolean;
  callback: (line: string) => TNode;
}

export class CodeOwners {
  public nodes: DefaultNodes[] = [];

  protected rules: ParsingRules[] = [
    {
      predicate: (line: string) => line.trim().startsWith(NodeToken.Comment),
      callback: (line: string) => new CommentNode(line),
    },
    {
      predicate: (line: string) => line.trim() === "",
      callback: (line: string) => new RawNode(line),
    },
    // defaults to a PathNode if the above rules don't match
    {
      predicate: (line: string) => true,
      callback: (line: string) => new PathNode(line),
    },
  ];

  static parse(source: string): CodeOwners {
    const codeowners = new CodeOwners();

    const lines = source.split("\n");
    for (const line of lines) {
      const rule = codeowners.rules.find((r) => r.predicate(line));
      if (rule) {
        codeowners.nodes.push(rule.callback(line));
      }
    }
    return codeowners;
  }

  public toString(): string {
    return this.nodes.map((node) => node.toString()).join("\n");
  }
}
