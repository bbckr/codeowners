import { CodeOwners, CodeOwnersSpec, NodesType } from "../codeowners";
import {
  CommentNode,
  PathNode,
  RawNode,
  NodeToken,
  SectionNode,
  InnerNode,
  LeafNode,
} from "../nodes";

interface ParsingRule<T> {
  predicate: (line: string) => boolean;
  callback: (line: string) => T;
}

export class CodeOwnersParser<
  T extends CodeOwnersSpec = CodeOwnersSpec.Default,
> {
  private spec: T;
  private rules: ParsingRule<NodesType<T>>[];

  public constructor(spec: T = CodeOwnersSpec.Default as T) {
    this.spec = spec;
    if (spec === CodeOwnersSpec.Default) {
      this.rules = [CommentNodeRule, RawNodeRule, PathNodeRule];
    } else if (spec === CodeOwnersSpec.Gitlab) {
      this.rules = [
        SectionNodeRule,
        OptionalSectionNodeRule,
        CommentNodeRule,
        RawNodeRule,
        PathNodeRule,
      ];
    } else {
      throw new Error("Unsupported spec");
    }
  }

  public parse(source: string): CodeOwners<T> {
    const nodes: NodesType<T>[] = [];

    let currentParent: InnerNode | undefined;

    const lines = source.split("\n");
    for (const line of lines) {
      const rule = this.rules.find((r) => r.predicate(line));
      if (!rule) {
        continue;
      }

      const node = rule.callback(line);

      // Codeowners at most is 2 levels deep, meaning when we run into a parent node, we
      // can treat all subsequent nodes as children until we run into another parent node
      if (node instanceof InnerNode) {
        currentParent = node;
        nodes.push(node);
      } else if (currentParent && node instanceof LeafNode) {
        node.parent = currentParent;
        currentParent.children.push(node);
      } else {
        nodes.push(node);
      }
    }
    return new CodeOwners(nodes, this.spec);
  }
}

/**
 *
 * Default Parsing Rules
 *
 */

const CommentNodeRule: ParsingRule<CommentNode> = {
  predicate: (line: string) => line.trim().startsWith(NodeToken.Comment),
  callback: (line: string) => {
    const comment = line.replace(CommentNodeTokenRegexp, "");
    return new CommentNode(comment);
  },
};

const CommentNodeTokenRegexp = new RegExp(`^${NodeToken.Comment}`);

const RawNodeRule: ParsingRule<RawNode> = {
  predicate: (line: string) => line.trim() === "",
  callback: (line: string) => new RawNode(line),
};

const PathNodeRule: ParsingRule<PathNode> = {
  // last rule, defaults to true if other rules are not matched
  predicate: () => true,
  callback: (line: string) => {
    const [comment, idx] = parseInlineComment(line);

    let subcontent = line;
    if (idx !== -1) {
      subcontent = subcontent.substring(0, idx);
    }

    // split on whitespace, but not escaped whitespace in case in path
    const [path, ...owners] = subcontent.trim().split(/(?<!\\)\s+/);
    return new PathNode(path, owners, comment);
  },
};

function parseInlineComment(str: string): [string | undefined, number] {
  const idx = str.indexOf(` ${NodeToken.Comment}`);
  if (idx === -1) {
    return [undefined, idx];
  }
  return [str.substring(idx + 2), idx];
}

/**
 *
 * Gitlab Parsing Rules
 *
 */

const SectionNodeRule: ParsingRule<SectionNode> = {
  predicate: (line: string) => line.trim().startsWith(NodeToken.Section),
  callback: (line: string) => parseSection(line),
};

const OptionalSectionNodeRule: ParsingRule<SectionNode> = {
  predicate: (line: string) =>
    line.trim().startsWith(NodeToken.OptionalSection),
  callback: (line: string) => parseSection(line, true),
};

const SectionNodeTokenRegexp = new RegExp(/(\[[\w\s]+\])(\[\d+\])*/);

function parseSection(str: string, optional: boolean = false): SectionNode {
  const [comment, cIdx] = parseInlineComment(str);

  let subcontent = str;
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

  const [name, count] = parseSectionHeader(section);
  return new SectionNode(name, optional, owners, count, comment);
}

function parseSectionHeader(str: string): [string, number | undefined] {
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
