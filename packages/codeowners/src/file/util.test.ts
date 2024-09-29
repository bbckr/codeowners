import { findCodeOwnersPath } from "./util";

describe("findCodeOwnersPath", () => {
  it("should find the CODEOWNERS file", () => {
    const path = findCodeOwnersPath("CODEOWNERS", "../../testdata");
    expect(path).toEqual("CODEOWNERS");
  });
});
