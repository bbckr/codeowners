import { CommentNode, PathNode, RawNode, AbstractNode } from "../nodes";
import { NodeToken } from "../tokens";

export type DefaultNodes = CommentNode | PathNode | RawNode | AbstractNode;

export interface ParsingRules {
  predicate: (line: string) => boolean;
  callback: (line: string) => AbstractNode;
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

  public getOwners(filepath: string): string[] {
    // check if the filepath matches the glob pattern in the path node
    // - starts from the end of the array to prioritize the last match
    // - if the node is an inner node, check its children nodes from end to start
    // - if the path matches, return the owners
    // - if there are no owners, check the parent node. if the parent node
    // - is ownable, then return the parent node owners. otherwise there are no owners

    return [];
  }
}
