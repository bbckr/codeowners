import { PathNode, NewlineNode, CommentNode, RawNode } from "./nodes";

describe("EntryNode", () => {
  it("should parse entry", () => {
    const entry = new PathNode("/some/path owner1 @owner2");
    expect(entry.path).toBe("/some/path");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBeUndefined();
    expect(entry.toString()).toBe("/some/path owner1 @owner2");
  });

  it("should parse entry with comment", () => {
    const entry = new PathNode(
      "\\#path/with/hash owner1 @owner2 # comment # same comment",
    );
    expect(entry.path).toBe("\\#path/with/hash");
    expect(entry.owners).toEqual(["owner1", "@owner2"]);
    expect(entry.comment).toBe(" comment # same comment");
    expect(entry.toString()).toBe(
      "\\#path/with/hash owner1 @owner2 # comment # same comment",
    );
  });
});

describe("NewlineNode", () => {
  it("should parse newline", () => {
    const newline = new NewlineNode("\n   ");
    expect(newline.toString()).toBe("\n");
  });
});

describe("CommentNode", () => {
  it("should parse comment", () => {
    const comment = new CommentNode("# comment");
    expect(comment.comment).toBe(" comment");
    expect(comment.toString()).toBe("# comment");
  });
});

describe("RawNode", () => {
  it("should parse raw content", () => {
    const raw = new RawNode("raw content");
    expect(raw.toString()).toBe("raw content");
  });
});
