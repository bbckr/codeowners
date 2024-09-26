import { CommentNode, PathNode, RawNode, SectionNode } from "../nodes";
import { GitlabCodeOwners } from "./gitlab";

describe("GitlabCodeOwners", () => {
  describe("parse", () => {
    it("should parse gitlab codeowners", () => {
      const input = `[Section] @bbckr
# comment # same comment
/some/path owner1 @owner2

/path/2 # comment`;
      const codeowners = GitlabCodeOwners.parse(input);
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
  });
});
