import { shuffleArray } from "./shuffle";

export function generateAssignments(names: string[]) {
  let shuffled: string[];

  do {
    shuffled = shuffleArray(names);
  } while (names.some((name, i) => name === shuffled[i]));

  const result: Record<string, string> = {};

  names.forEach((name, index) => {
    result[name] = shuffled[index];
  });

  return result;
}
