import { CodeOwners, DefaultNodes, ParsingRules } from "./file";
import { SectionNode } from "../nodes";
import { GitlabNodeToken } from "../tokens";

export type GitlabNodes = DefaultNodes | SectionNode;

export class GitlabCodeOwners extends CodeOwners {
  public nodes: GitlabNodes[] = [];

  protected rules: ParsingRules[] = [
    {
      predicate: (line: string) => line.startsWith(GitlabNodeToken.Section),
      callback: (line: string) => new SectionNode(line),
    },
    ...this.rules,
  ];

  static parse(source: string): GitlabCodeOwners {
    const codeowners = new GitlabCodeOwners();

    let currentSection: SectionNode | undefined;

    const lines = source.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      const rule = codeowners.rules.find((r) => r.predicate(trimmed));
      if (!rule) {
        continue;
      }

      const node = rule.callback(line);

      if (node instanceof SectionNode) {
        currentSection = node;
        codeowners.nodes.push(node);
      } else if (currentSection) {
        node.parent = currentSection;
        currentSection.children.push(node);
      } else {
        codeowners.nodes.push(node);
      }
    }
    return codeowners;
  }
}
