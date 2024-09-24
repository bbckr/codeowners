import { CodeOwners } from "./file";
import { CommentNode, PathNode, RawNode } from "../nodes";

describe("CodeOwners", () => {
  describe("parse", () => {
    it("should parse codeowners", () => {
      const input = `# comment # same comment
/some/path owner1 @owner2

/path/2 # comment`;
      const codeowners = CodeOwners.parse(input);
      expect(codeowners.nodes).toHaveLength(4);
      expect(codeowners.nodes[0]).toBeInstanceOf(CommentNode);
      expect(codeowners.nodes[1]).toBeInstanceOf(PathNode);
      expect(codeowners.nodes[2]).toBeInstanceOf(RawNode);
      expect(codeowners.nodes[3]).toBeInstanceOf(PathNode);
      expect(codeowners.toString()).toEqual(input);
    });
  });
});
