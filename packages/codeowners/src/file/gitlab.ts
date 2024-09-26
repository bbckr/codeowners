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
}
