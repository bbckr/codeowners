import { parseInlineComment, parseSection } from "./util";

describe("parseInlineComment", () => {
  it("should parse inline comment", () => {
    const [comment, idx] = parseInlineComment("some content # comment");
    expect(comment).toBe(" comment");
    expect(idx).toBe(12);
  });

  it("should return undefined for no comment", () => {
    const [comment, idx] = parseInlineComment("some content");
    expect(comment).toBeUndefined();
    expect(idx).toBe(-1);
  });
});

describe("parseSection", () => {
  it("should parse section", () => {
    const [name, count] = parseSection("[section]");
    expect(name).toBe("section");
    expect(count).toBeUndefined();
  });

  it("should parse section with count", () => {
    const [name, count] = parseSection("[section][2] owner1 owner2");
    expect(name).toBe("section");
    expect(count).toBe(2);
  });

  it("should parse section with optional count", () => {
    const [name, count] = parseSection("[section] owner1 owner2");
    expect(name).toBe("section");
    expect(count).toBeUndefined();
  });

  it("should parse optional section", () => {
    const [name, count] = parseSection("^[section]");
    expect(name).toBe("section");
    expect(count).toBeUndefined();
  });
});
