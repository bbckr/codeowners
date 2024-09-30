import { CodeOwners, CodeOwnersSpec } from "./codeowners";
import { PathNode, SectionNode } from "../nodes";

describe("CodeOwners", () => {
  describe("DefaultCodeOwnersSpec.getOwners", () => {
    it("should return multiple owners for path", () => {
      const codeowners = new CodeOwners([
        new PathNode("*", ["@global-owner1", "@global-owner2"]),
      ]);
      expect(codeowners.getOwners("file")).toEqual([
        "@global-owner1",
        "@global-owner2",
      ]);
    });

    it("should return single owner for path", () => {
      const codeowners = new CodeOwners([new PathNode("*.js", ["@js-owner"])]);
      expect(codeowners.getOwners("file.js")).toEqual(["@js-owner"]);
    });

    it("should return no owners for path", () => {
      const codeowners = new CodeOwners([
        new PathNode("*", ["@global-owner1", "@global-owner2"]),
        new PathNode("*.go", []),
      ]);
      expect(codeowners.getOwners("file.go")).toEqual([]);
    });

    it("should return owners for nested dirs", () => {
      const codeowners = new CodeOwners([
        new PathNode("**/logs", ["@octocat"]),
      ]);
      expect(codeowners.getOwners("logs/error.log")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("src/logs/error.log")).toEqual(["@octocat"]);
    });

    it("should return owners for directory paths", () => {
      const codeowners = new CodeOwners([
        new PathNode("/apps/", ["@octocat"]),
        new PathNode("/apps/github", ["@doctocat"]),
      ]);
      expect(codeowners.getOwners("apps/")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("apps/github")).toEqual(["@doctocat"]);
    });

    it("should return no owner for directory path", () => {
      const codeowners = new CodeOwners([
        new PathNode("/apps/", ["@octocat"]),
        new PathNode("/apps/github", []),
      ]);
      expect(codeowners.getOwners("apps/")).toEqual(["@octocat"]);
      expect(codeowners.getOwners("apps/github")).toEqual([]);
    });
  });

  describe("GitlabCodeOwnersSpec.getOwners", () => {
    it("should return single group for path", () => {
      const codeowners = new CodeOwners(
        [new PathNode("file.md", ["@group-x"])],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("file")).toEqual([]);
      expect(codeowners.getOwners("file.md")).toEqual(["@group-x"]);
    });

    it("should return multiple groups for path", () => {
      const codeowners = new CodeOwners(
        [new PathNode("file.md", ["@group-x", "@group-x/subgroup-y"])],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("file")).toEqual([]);
      expect(codeowners.getOwners("file.md")).toEqual([
        "@group-x",
        "@group-x/subgroup-y",
      ]);
    });

    it("should return when owner is matched in two paths", () => {
      const codeowners = new CodeOwners(
        [
          new PathNode("*.md", ["@docs-team"]),
          new PathNode("terms.md", ["@legal-team"]),
        ],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("LICENSE")).toEqual([]);
      expect(codeowners.getOwners("README.md")).toEqual(["@docs-team"]);
      expect(codeowners.getOwners("terms.md")).toEqual(["@legal-team"]);
    });

    it("should return owners for single section", () => {
      const codeowners = new CodeOwners(
        [
          new SectionNode(
            "README Owners",
            false,
            [],
            undefined,
            undefined,
            undefined,
            [
              new PathNode("README.md", ["@user1", "@user2"]),
              new PathNode("internal/README.md", ["@user4"]),
            ],
          ),
        ],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("terms.md")).toEqual([]);
      expect(codeowners.getOwners("README.md")).toEqual(["@user1", "@user2"]);
      expect(codeowners.getOwners("internal/README.md")).toEqual(["@user4"]);
    });

    it("should return owners for multiple sections", () => {
      const codeowners = new CodeOwners(
        [
          new PathNode("*", ["@admin"]),
          new SectionNode(
            "README Owners",
            false,
            [],
            undefined,
            undefined,
            undefined,
            [
              new PathNode("README.md", ["@user1", "@user2"]),
              new PathNode("internal/README.md", ["@user4"]),
            ],
          ),
          new SectionNode(
            "README other owners",
            false,
            [],
            undefined,
            undefined,
            undefined,
            [new PathNode("README.md", ["@user3"])],
          ),
        ],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("terms.md")).toEqual(["@admin"]);
      expect(codeowners.getOwners("internal/README.md")).toEqual(["@user3"]);
      expect(codeowners.getOwners("README.md")).toEqual(["@user3"]);
    });

    it("should return default owner for section", () => {
      const codeowners = new CodeOwners(
        [
          new SectionNode(
            "Documentation",
            false,
            ["@docs-team"],
            undefined,
            undefined,
            undefined,
            [new PathNode("docs", []), new PathNode("README.md", [])],
          ),
          new SectionNode(
            "Database",
            false,
            ["@database-team", "@agarcia"],
            undefined,
            undefined,
            undefined,
            [
              new PathNode("model/db/", []),
              new PathNode("config/db/database-setup.md", ["@docs-team"]),
            ],
          ),
        ],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("docs/SETUP.md")).toEqual(["@docs-team"]);
      expect(codeowners.getOwners("README.md")).toEqual(["@docs-team"]);
      expect(codeowners.getOwners("model/db/user.js")).toEqual([
        "@database-team",
        "@agarcia",
      ]);
      expect(codeowners.getOwners("config/db/database-setup.md")).toEqual([
        "@docs-team",
      ]);
    });

    it("should return no owner for path in section", () => {
      const codeowners = new CodeOwners(
        [
          new PathNode("*", ["@general-approvers"]),
          new SectionNode(
            "Documentation",
            false,
            [],
            undefined,
            undefined,
            undefined,
            [new PathNode("README.md", [])],
          ),
        ],
        CodeOwnersSpec.Gitlab,
      );
      expect(codeowners.getOwners("package.json")).toEqual([
        "@general-approvers",
      ]);
      expect(codeowners.getOwners("README.md")).toEqual([]);
    });
  });
});
