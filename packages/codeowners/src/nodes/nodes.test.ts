import { PathNode, RawNode, CommentNode, SectionNode } from "./nodes";

describe("EntryNode", () => {
  it("should stringify entry", () => {
    const entry = new PathNode("/some/path", ["owner1", "@owner2"]);
    expect(entry.path).toBe("/some/path");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe("/some/path owner1 @owner2");
  });

  it("should stringify entry with comment", () => {
    const entry = new PathNode(
      "\\#path/with/hash",
      ["owner1", "@owner2"],
      " comment # same comment",
    );
    expect(entry.path).toBe("\\#path/with/hash");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBe(" comment # same comment");
    expect(entry.toString()).toBe(
      "\\#path/with/hash owner1 @owner2 # comment # same comment",
    );
  });

  it("should stringify path with no owners", () => {
    const entry = new PathNode("/some/path", []);
    expect(entry.path).toBe("/some/path");
    expect(entry.owners).toEqual([]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe("/some/path");
  });
});

describe("RawNode", () => {
  it("should stringify newline", () => {
    const newline = new RawNode("    \n");
    expect(newline.toString()).toBe("    \n");
  });
});

describe("CommentNode", () => {
  it("should stringify comment", () => {
    const comment = new CommentNode(" comment");
    expect(comment.toString()).toBe("# comment");
  });
});

describe("SectionNode", () => {
  it("should stringify section name", () => {
    const section = new SectionNode("section name", false);
    expect(section.toString()).toBe("[section name]");
  });

  it("should stringify section name with count", () => {
    const section = new SectionNode("section", false, [], 1);
    expect(section.toString()).toBe("[section][1]");
  });

  it("should stringify section name with owners", () => {
    const section = new SectionNode("section name", false, [
      "owner1",
      "@owner2",
    ]);
    expect(section.toString()).toBe("[section name] owner1 @owner2");
  });

  it("should stringify section name with count and owners", () => {
    const section = new SectionNode("section", false, ["owner1", "@owner2"], 1);
    expect(section.toString()).toBe("[section][1] owner1 @owner2");
  });

  it("should stringify section name with count and owners and comment", () => {
    const section = new SectionNode(
      "section",
      false,
      ["owner1", "@owner2"],
      10,
      " comment # still part of comment",
    );
    expect(section.toString()).toBe(
      "[section][10] owner1 @owner2 # comment # still part of comment",
    );
  });

  it("should stringify optional section", () => {
    const section = new SectionNode("section", true);
    expect(section.name).toBe("section");
    expect(section.count).toBeUndefined();
    expect(section.optional).toBe(true);
    expect(section.owners).toEqual([]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("^[section]");
  });
});
