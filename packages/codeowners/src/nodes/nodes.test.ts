import { PathNode, RawNode, CommentNode } from "./nodes";

describe("EntryNode", () => {
  it("should parse entry", () => {
    const entry = PathNode.parse("/some/path owner1 @owner2");
    expect(entry.path).toBe("/some/path");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe("/some/path owner1 @owner2");
  });

  it("should parse entry with comment", () => {
    const entry = PathNode.parse(
      "\\#path/with/hash owner1 @owner2 # comment # same comment",
    );
    expect(entry.path).toBe("\\#path/with/hash");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBe(" comment # same comment");
    expect(entry.toString()).toBe(
      "\\#path/with/hash owner1 @owner2 # comment # same comment",
    );
  });

  it("should parse path with no owners", () => {
    const entry = PathNode.parse("/some/path");
    expect(entry.path).toBe("/some/path");
    expect(entry.owners).toEqual([]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe("/some/path");
  });

  it("should parse path with formatted whitespace", () => {
    const entry = PathNode.parse("/some/path       owner1 @owner2 ");
    expect(entry.path).toBe("/some/path");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe("/some/path owner1 @owner2");
  });

  it("should parse path with escaped whitespace", () => {
    const entry = PathNode.parse(
      "/some/path\\ with\\ whitespace owner1 @owner2",
    );
    expect(entry.path).toBe("/some/path\\ with\\ whitespace");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe(
      "/some/path\\ with\\ whitespace owner1 @owner2",
    );
  });
});

describe("RawNode", () => {
  it("should parse newline", () => {
    const newline = new RawNode("    \n");
    expect(newline.toString()).toBe("    \n");
  });
});

describe("CommentNode", () => {
  it("should parse comment", () => {
    const comment = CommentNode.parse("# comment");
    expect(comment.comment).toBe(" comment");
    expect(comment.toString()).toBe("# comment");
  });
});
