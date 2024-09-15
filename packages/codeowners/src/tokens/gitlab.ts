export enum GitlabNodeToken {
  Section = "[",
  OptionalSection = "^[",
}

export const SectionNodeTokenRegexp = new RegExp(/(\[[\w\s]+\])(\[\d+\])*/);
