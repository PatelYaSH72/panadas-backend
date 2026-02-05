import { Filter } from "bad-words";

const filter = new Filter();

export const containsAbuse = (...texts) => {
  return texts.some((text) => filter.isProfane(text));
};
