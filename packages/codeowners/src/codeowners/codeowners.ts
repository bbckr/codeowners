import {
  CommentNode,
  PathNode,
  RawNode,
  AbstractNode,
  InnerNode,
  isOwnable,
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

    // bbckr: notes for future implementation
    // implement duplicate section names as part of getting the owners of a section
    // per-gitlab, if multiple sections have the same name, they are "combined". also, section
    // headings are not case-sensitive. (this only matters when a path in a lower section doesn't
    // have an owner, and needs to default to the section owner of a matching section)
    // see: https://docs.gitlab.com/ee/user/project/codeowners/#sections-with-duplicate-names
    // may need to nest codeowners nodes under a root node to traverse recursively and get owners
    // based on per-node getOwners methods.

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
