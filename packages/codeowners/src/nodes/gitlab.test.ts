import { SectionNode } from "./gitlab";

describe("SectionNode", () => {
  it("should parse section name", () => {
    const section = new SectionNode("[section]");
    expect(section.name).toBe("section");
    expect(section.count).toBeUndefined();
    expect(section.optional).toBe(false);
    expect(section.owners).toEqual([]);
    expect(section.comment).toBeUndefined();
    expect(section.toString()).toBe("[section]");
  });
});
