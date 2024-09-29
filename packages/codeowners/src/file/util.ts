import * as findUp from "find-up";

export function findCodeOwnersPath(filename: string, cwd?: string): string {
  const options = {
    cwd: cwd ?? process.cwd(),
  };

  const codeOwnersPaths = [
    filename,
    `.bitbucket/${filename}`,
    `.github/${filename}`,
    `.gitlab/${filename}`,
    `docs/${filename}`,
  ];

  const codeOwnersPath = findUp.sync(codeOwnersPaths, options);
  if (!codeOwnersPath) {
    throw new Error(`No CODEOWNERS file found`);
  }

  return codeOwnersPath;
}
