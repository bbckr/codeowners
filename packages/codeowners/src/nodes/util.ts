import { NodeToken, SectionNodeTokenRegexp } from "../tokens";

export function parseInlineComment(str: string): [string | undefined, number] {
  const idx = str.indexOf(` ${NodeToken.Comment}`);
  if (idx === -1) {
    return [undefined, idx];
  }
  return [str.substring(idx + 2), idx];
}

export function parseSection(str: string): [string, number | undefined] {
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
