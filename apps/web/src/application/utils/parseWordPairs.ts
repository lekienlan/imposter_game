import { WordPair } from "@imposter/shared";

export const parseWordPairs = (value: string): WordPair[] => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [citizen, spy] = line.split("|").map((item) => item.trim());
      return { citizen, spy };
    })
    .filter((pair) => pair.citizen.length > 0 && pair.spy.length > 0);
};
