# @bbckr/codeowners

![license](https://img.shields.io/npm/l/@bbckr/codeowners) ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bbckr/codeowners/build.yml?branch=main) ![Codecov](https://codecov.io/gh/bbckr/codeowners/branch/main/graph/badge.svg)

A TypeScript library for parsing and composing CODEOWNERS files.

## Features

- Supports both [GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) and [GitLab](https://docs.gitlab.com/user/project/codeowners/reference/) CODEOWNERS syntax
- Preserves comments and whitespace
- Provides a way to get owners for a given file
- Parses CODEOWNERS files into an AST (Abstract Syntax Tree), allowing you to compose a CODEOWNERS file with entries, comments, and even sections (GitLab spec only)

## Installation

```bash
npm install @bbckr/codeowners
```

```bash
yarn add @bbckr/codeowners
```

## Usage

### Parse a CODEOWNERS file

```ts
import { CodeOwnersParser } from "@bbckr/codeowners";

const input = `
# comment # same comment
/some/path owner1 @owner2

/path/2 # comment
`;

const parser = new CodeOwnersParser();
const codeowners = parser.parse(input);
```

### Get the owners of a file

```ts
const owners = codeowners.getOwners("path/to/file");
```

#### Output

```
['@owner1', '@owner2']
```

### Compose a CODEOWNERS file programatically

```ts
import { CodeOwners, PathNode, CommentNode } from "@bbckr/codeowners";

const codeowners = new CodeOwners([
  new PathNode("/path/to/file", ["owner1", "@owner2"]),
  new CommentNode("# comment"),
]);
```

#### Output

```
/path/to/file owner1 @owner2
# comment
```

### Compose a GitLab CODEOWNERS file programatically

```ts
import {
  CodeOwners,
  CodeOwnersSpec,
  PathNode,
  SectionNode,
} from "@bbckr/codeowners";

const codeowners = new CodeOwners(
  [
    new PathNode("/path/to/file", ["owner1", "@owner2"]),
    new SectionNode(
      "README Owners", // section name
      false, // optional section
      [], // owners
      undefined, // count
      undefined, // comment
      undefined, // parent, undefined for root of file
      [
        new PathNode("README.md", ["@user1", "@user2"]),
        new PathNode("internal/README.md", ["@user4"]),
      ],
    ),
  ],
  CodeOwnersSpec.Gitlab,
);
```

#### Output

```
/path/to/file owner1 @owner2
[README Owners]
README.md @user1 @user2
internal/README.md @user4
```
