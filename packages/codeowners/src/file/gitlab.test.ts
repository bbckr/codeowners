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
      expect(codeowners.nodes[0].children).toHaveLength(4);
      expect(codeowners.nodes[0].children[0]).toBeInstanceOf(CommentNode);
      expect(codeowners.nodes[0].children[1]).toBeInstanceOf(PathNode);
      expect(codeowners.nodes[0].children[2]).toBeInstanceOf(RawNode);
      expect(codeowners.nodes[0].children[3]).toBeInstanceOf(PathNode);
      expect(codeowners.toString()).toEqual(input);
    });
  });
});
