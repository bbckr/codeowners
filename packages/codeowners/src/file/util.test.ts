import { findCodeOwnersPath } from "./util";
import path from "path";

describe("findCodeOwnersPath", () => {
  it("should find the CODEOWNERS file", () => {
    const testdir = path.join(__dirname, "../../testdata");
    const codeowners = findCodeOwnersPath("CODEOWNERS", testdir);
    expect(codeowners).toEqual(`${testdir}/CODEOWNERS`);
  });
});
