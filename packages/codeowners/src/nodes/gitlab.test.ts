import { SectionNode } from "./gitlab";

describe("SectionNode", () => {
  it("should parse section name", () => {
    const section = new SectionNode("[section name]");
    expect(section.name).toBe("section name");
    expect(section.count).toBeUndefined();
    expect(section.optional).toBe(false);
    expect(section.owners).toEqual([]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("[section name]");
  });

  it("should parse section name with count", () => {
    const section = new SectionNode("[section][1]");
    expect(section.name).toBe("section");
    expect(section.count).toBe(1);
    expect(section.optional).toBe(false);
    expect(section.owners).toEqual([]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("[section][1]");
  });

  it("should parse section name with owners", () => {
    const section = new SectionNode("[section] owner1 @owner2");
    expect(section.name).toBe("section");
    expect(section.count).toBeUndefined();
    expect(section.optional).toBe(false);
    expect(section.owners).toEqual(["owner1", "@owner2"]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("[section] owner1 @owner2");
  });

  it("should parse section name with count and owners", () => {
    const section = new SectionNode("[section][1] owner1 @owner2");
    expect(section.name).toBe("section");
    expect(section.count).toBe(1);
    expect(section.optional).toBe(false);
    expect(section.owners).toEqual(["owner1", "@owner2"]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("[section][1] owner1 @owner2");
  });

  it("should parse section name with count and owners and comment", () => {
    const section = new SectionNode(
      "[section][10] owner1 @owner2 # comment # still part of comment",
    );
    expect(section.name).toBe("section");
    expect(section.count).toBe(10);
    expect(section.optional).toBe(false);
    expect(section.owners).toEqual(["owner1", "@owner2"]);
    expect(section.comment).toBe(" comment # still part of comment");
    expect(section.toString()).toBe(
      "[section][10] owner1 @owner2 # comment # still part of comment",
    );
  });

  it("should parse optional section", () => {
    const section = new SectionNode("^[section]", true);
    expect(section.name).toBe("section");
    expect(section.count).toBeUndefined();
    expect(section.optional).toBe(true);
    expect(section.owners).toEqual([]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("^[section]");
  });
});
