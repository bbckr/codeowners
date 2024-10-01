import {
  CommentNode,
  PathNode,
  RawNode,
  AbstractNode,
  InnerNode,
  SectionNode,
} from "../nodes";
import ignore from "ignore";

export enum CodeOwnersSpec {
  Default = "default",
  Gitlab = "gitlab",
}

// conditional type to switch between allowed node types for a given codeowners spec
export type NodesType<T extends CodeOwnersSpec> =
  T extends CodeOwnersSpec.Default ? DefaultSpecNodes : GitlabSpecNodes;

export type DefaultSpecNodes = CommentNode | PathNode | RawNode | AbstractNode;

export type GitlabSpecNodes = DefaultSpecNodes | SectionNode;

const EMPTY_ARRAY: string[] = [];

export class CodeOwners<T extends CodeOwnersSpec = CodeOwnersSpec.Default> {
  public readonly spec: T;
  public nodes: NodesType<T>[] = [];

  constructor(
    nodes: NodesType<T>[] = [],
    spec: T = CodeOwnersSpec.Default as T,
  ) {
    this.nodes = nodes;
    this.spec = spec;
  }

  public toString(): string {
    return this.nodes.map((node) => node.toString()).join("\n");
  }

  public getOwners(filepath: string): string[] {
    // codeowners prioritizes the last matching pattern, so we iterate in reverse,
    // only caring about path nodes or nodes that can contain path nodes
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];

      // check if the path matches the glob and return the owners
      if (node instanceof PathNode) {
        if (match(filepath, node.path)) {
          // check if path matches the glob
          return [...node.owners];
        }
      }

      // some inner nodes can have children that are paths. since codeowners files are
      // only 2 levels deep at most (due to section node being the only inner node, and
      // it only containing leaf node children), we can simply check for path nodes here
      if (node instanceof InnerNode) {
        for (let j = node.children.length - 1; j >= 0; j--) {
          const child = node.children[j];

          // check if the path matches the glob and return the owners
          if (child instanceof PathNode) {
            if (match(filepath, child.path)) {
              return child.owners;
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
