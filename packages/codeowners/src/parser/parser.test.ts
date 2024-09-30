import path from "path";
import fs from "fs";
import { CommentNode, PathNode, RawNode, SectionNode } from "../nodes";
import { CodeOwnersParser } from "./parser";
import { CodeOwnersSpec } from "../codeowners";

describe("CodeOwnersParser", () => {
  it("should parse codeowners", () => {
    const input = `# comment # same comment
/some/path owner1 @owner2

/path/2 # comment`;
    const parser = new CodeOwnersParser();
    const codeowners = parser.parse(input);
    expect(codeowners.nodes).toHaveLength(4);
    expect(codeowners.nodes[0]).toBeInstanceOf(CommentNode);
    expect(codeowners.nodes[1]).toBeInstanceOf(PathNode);
    expect(codeowners.nodes[2]).toBeInstanceOf(RawNode);
    expect(codeowners.nodes[3]).toBeInstanceOf(PathNode);
    expect(codeowners.toString()).toEqual(input);
  });

  it("should parse github spec codeowners", () => {
    const filepath = path.join(__dirname, "../../testdata/CODEOWNERS");
    const input = fs.readFileSync(filepath, "utf8");
    const parser = new CodeOwnersParser();
    const codeowners = parser.parse(input);
    expect(codeowners.toString()).toEqual(input);
  });

  it("should parse gitlab codeowners", () => {
    const input = `[Section] @bbckr
# comment # same comment
/some/path owner1 @owner2

/path/2 # comment`;
    const parser = new CodeOwnersParser(CodeOwnersSpec.Gitlab);
    const codeowners = parser.parse(input);
    expect(codeowners.nodes).toHaveLength(1);
    expect(codeowners.nodes[0]).toBeInstanceOf(SectionNode);
    const section = codeowners.nodes[0] as SectionNode;
    expect(section.children).toHaveLength(4);
    expect(section.children[0]).toBeInstanceOf(CommentNode);
    expect(section.children[1]).toBeInstanceOf(PathNode);
    expect(section.children[2]).toBeInstanceOf(RawNode);
    expect(section.children[3]).toBeInstanceOf(PathNode);
    expect(codeowners.toString()).toEqual(input);
  });

  it("should parse gitlab spec codeowners", () => {
    const filepath = path.join(__dirname, "../../testdata/.gitlab/CODEOWNERS");
    const input = fs.readFileSync(filepath, "utf8");
    const parser = new CodeOwnersParser(CodeOwnersSpec.Gitlab);
    const codeowners = parser.parse(input);
    expect(codeowners.toString()).toEqual(input);
  });
});
