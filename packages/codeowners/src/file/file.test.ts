import { CodeOwners, findCodeOwnersPath } from "./file";
import { CommentNode, PathNode, RawNode } from "../nodes";
import path from "path";
import fs from "fs";

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

    it("should parse github spec codeowners", () => {
      const filepath = path.join(__dirname, "../../testdata/CODEOWNERS");
      const input = fs.readFileSync(filepath, "utf8");
      const codeowners = CodeOwners.parse(input);
      expect(codeowners.toString()).toEqual(input);
    });
  });

  describe("getOwners", () => {
    it("should get owners for github spec", () => {
      const filepath = path.join(__dirname, "../../testdata/CODEOWNERS");
      const input = fs.readFileSync(filepath, "utf8");
      const codeowners = CodeOwners.parse(input);

      expect(codeowners.getOwners("README.md")).toEqual([
        "@global-owner1",
        "@global-owner2",
      ]);
      expect(codeowners.getOwners("index.js")).toEqual(["@js-owner"]);
      expect(codeowners.getOwners("main.go")).toEqual(["docs@example.com"]);
      expect(codeowners.getOwners("logs.txt")).toEqual(["@octo-org/octocats"]);
      expect(codeowners.getOwners("build/tmp/output.dll")).toEqual([
        "@doctocat",
      ]);
      expect(codeowners.getOwners("docs/README.md")).toEqual([
        "docs@example.com",
      ]);
      expect(codeowners.getOwners("apps/index.js")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("documentation/README.md")).toEqual([
        "@doctocat",
      ]);
      expect(codeowners.getOwners("tmp/logs/logs.txt")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("pkg/index.js")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("pkg/github/index.js")).toEqual([]);
      expect(codeowners.getOwners("src/main.go")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("src/github/main.go")).toEqual(["@doctocat"]);
    });
  });
});

describe("findCodeOwnersPath", () => {
  it("should find the CODEOWNERS file", () => {
    const testdir = path.join(__dirname, "../../testdata");
    const codeowners = findCodeOwnersPath("CODEOWNERS", testdir);
    expect(codeowners).toEqual(`${testdir}/CODEOWNERS`);
  });
});
