import {
  CommentNode,
  PathNode,
  RawNode,
  AbstractNode,
  InnerNode,
  isOwnable,
} from "../nodes";
import { NodeToken } from "../tokens";
import ignore from "ignore";
import { findCodeOwnersPath } from "./util";
import fs from "fs";

export type DefaultNodes = CommentNode | PathNode | RawNode | AbstractNode;

const EMPTY_ARRAY: string[] = [];

export interface ParsingRules {
  predicate: (line: string) => boolean;
  callback: (line: string) => AbstractNode;
}

export class CodeOwners {
  protected _nodes: DefaultNodes[] = [];

  protected rules: ParsingRules[] = [
    {
      predicate: (line: string) => line.trim().startsWith(NodeToken.Comment),
      callback: (line: string) => CommentNode.parse(line),
    },
    {
      predicate: (line: string) => line.trim() === "",
      callback: (line: string) => new RawNode(line),
    },
    // defaults to a PathNode if the above rules don't match
    {
      predicate: () => true,
      callback: (line: string) => PathNode.parse(line),
    },
  ];

  static load(filename: string = "CODEOWNERS", cwd?: string): CodeOwners {
    const codeOwnersPath = findCodeOwnersPath(filename, cwd);
    const source = fs.readFileSync(codeOwnersPath, "utf8");
    return CodeOwners.parse(source);
  }

  static parse(source: string): CodeOwners {
    const codeowners = new CodeOwners();

    const lines = source.split("\n");
    for (const line of lines) {
      const rule = codeowners.rules.find((r) => r.predicate(line));
      if (rule) {
        codeowners._nodes.push(rule.callback(line));
      }
    }
    return codeowners;
  }

  public get nodes(): ReadonlyArray<DefaultNodes> {
    return this._nodes;
  }

  public toString(): string {
    return this._nodes.map((node) => node.toString()).join("\n");
  }

  public getOwners(filepath: string): string[] {
    // codeowners priotizes the last matching pattern, so we iterate in reverse,
    // only caring about path nodes or nodes that can contain path nodes
    for (let i = this._nodes.length - 1; i >= 0; i--) {
      const node = this._nodes[i];

      // check if the path matches the glob and return the owners
      if (node instanceof PathNode) {
        if (match(filepath, node.path)) {
          // check if path matches the glob
          return [...node.owners];
        }
      }

      // inner nodes can have children that are paths, where if the inner node
      // is ownable, the children can inherit the owners if they don't have any
      if (node instanceof InnerNode) {
        const owners = isOwnable(node) ? [...node.owners] : EMPTY_ARRAY;
        for (let j = node.children.length - 1; j >= 0; j--) {
          const child = node.children[j];

          // check if the path matches the glob and return the owners
          if (child instanceof PathNode) {
            if (match(filepath, child.path)) {
              if (child.owners.length > 0) {
                return [...child.owners];
              }
              // default to parent owners if no owners
              return owners;
            }
          }
        }
      }
    }

    // if no matches, return an empty array
    return EMPTY_ARRAY;
  }
}

function match(filepath: string, glob: string): boolean {
  // codeowners is based on gitignore spec, and the ignore package
  // follows the same spec. however, github codeowners mentions that
  // it does not support negation, character ranges, and escaping a
  // hash to treat as a pattern. we ignore these cases for now.
  // see: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
  const ig = ignore().add(glob);
  return ig.ignores(filepath);
}
