export enum NodeToken {
  Newline = "\n",
  Comment = "#",
}

export const CommentNodeTokenRegexp = new RegExp(`^${NodeToken.Comment}`);
