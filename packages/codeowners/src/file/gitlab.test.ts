import { CommentNode, PathNode, RawNode, SectionNode } from "../nodes";
import { GitlabCodeOwners } from "./gitlab";
import path from "path";
import fs from "fs";

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

    it("should parse gitlab spec codeowners", () => {
      const filepath = path.join(
        __dirname,
        "../../testdata/.gitlab/CODEOWNERS",
      );
      const input = fs.readFileSync(filepath, "utf8");
      const codeowners = GitlabCodeOwners.parse(input);
      expect(codeowners.toString()).toEqual(input);
    });
  });

  describe("getOwners", () => {
    it("should get owners for gitlab spec", () => {
      const filepath = path.join(
        __dirname,
        "../../testdata/.gitlab/CODEOWNERS",
      );
      const input = fs.readFileSync(filepath, "utf8");
      const codeowners = GitlabCodeOwners.parse(input);

      expect(codeowners.getOwners("index.js")).toEqual([]);
      expect(codeowners.getOwners("src/main.go")).toEqual(["@admin"]);
      expect(codeowners.getOwners("file.go")).toEqual([]);
      expect(codeowners.getOwners("README.md")).toEqual(["@docs-team"]);
      expect(codeowners.getOwners("config/db/database-setup.md")).toEqual([
        "@docs-team",
      ]);
      expect(codeowners.getOwners("model/db/")).toEqual([
        "@database-team",
        "@agarcia",
      ]);
      expect(codeowners.getOwners("terms.md")).toEqual(["@legal-team"]);
      expect(codeowners.getOwners("internal/README.md")).toEqual([
        "@docs-team",
      ]);
    });
  });
});
