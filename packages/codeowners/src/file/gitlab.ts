import { CodeOwners, DefaultNodes, ParsingRules } from "./file";
import { LeafNode, SectionNode } from "../nodes";
import { GitlabNodeToken } from "../tokens";

export type GitlabNodes = DefaultNodes | SectionNode;

export class GitlabCodeOwners extends CodeOwners {
  public nodes: GitlabNodes[] = [];

  protected rules: ParsingRules[] = [
    {
      predicate: (line: string) =>
        line.trim().startsWith(GitlabNodeToken.Section),
      callback: (line: string) => new SectionNode(line),
    },
    ...this.rules,
  ];

  static parse(source: string): GitlabCodeOwners {
    const codeowners = new GitlabCodeOwners();

    let currentSection: SectionNode | undefined;

    const lines = source.split("\n");
    for (const line of lines) {
      const rule = codeowners.rules.find((r) => r.predicate(line));
      if (!rule) {
        continue;
      }

      const node = rule.callback(line);

      if (node instanceof SectionNode) {
        currentSection = node;
        codeowners.nodes.push(node);
      } else if (currentSection && node instanceof LeafNode) {
        node.parent = currentSection;
        currentSection.children.push(node);
      } else {
        codeowners.nodes.push(node);
      }
    }
    return codeowners;
  }

  // bbckr: implement duplicate section names as part of getting the owners of a section
  // per-gitlab, if multiple sections have the same name, they are "combined". also, section
  // headings are not case-sensitive. (this only matters when a path in a lower section doesn't
  // have an owner, and needs to default to the section owner of a matching section)
  // see: https://docs.gitlab.com/ee/user/project/codeowners/#sections-with-duplicate-names
  // may need to nest codeowners nodes under a root node to traverse recursively and get owners
}
